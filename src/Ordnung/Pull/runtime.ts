// ./src/Ordnung/Pull/runtime.ts

import { useKartenStore } from "@/Ordnung/DatenBank/KartenStore";
import type { PullCtx, PullResult, PortRef } from "./types";
import { registry } from "./registry";
import { KNOTEN } from "@/Atlas/Karten.types";

const cache = new Map<string, PullResult>();
const inflight = new Set<string>();

function cacheKey(ref: PortRef, version: number) {
  return `${ref.kartenId}|${ref.nodeId}|${ref.handleId}|${version}`;
}

function currentVersion(kartenId: string, nodeId: string): number {
  const s = useKartenStore.getState();
  const gv = s.graphVersion?.[kartenId] ?? 0;
  const dv = s.nodeDataVersions?.[kartenId]?.[nodeId] ?? 0;
  return Math.max(gv, dv);
}

export async function pull(ref: PortRef): Promise<PullResult> {
  const state = useKartenStore.getState();
  const offene = state.geöffnet[ref.kartenId];
  const def = state.db[ref.kartenId];
  const graph = offene ?? def;
  if (!graph) return { ok: false, error: "Karte nicht gefunden" };

  const node = graph.nodes.find(n => n.id === ref.nodeId);
  if (!node) return { ok: false, error: "Knoten nicht gefunden" };

  const version = currentVersion(ref.kartenId, ref.nodeId);
  const key = cacheKey(ref, version);
  if (cache.has(key)) return cache.get(key)!;

  const compute = registry[node.type as KNOTEN];
  if (!compute) return { ok: false, error: `Kein Adapter für ${String(node.type)}` };

  if (inflight.has(key)) return { ok: false, error: "Zyklische Abhängigkeit" };
  inflight.add(key);

  const ctx: PullCtx = {
    pull,
    getNodeData: (kId, nId) => {
      const s = useKartenStore.getState();
      const o = s.geöffnet[kId] ?? s.db[kId];
      return o?.nodes.find(n => n.id === nId)?.data as any;
    },
    getGraph: kId => {
      const s = useKartenStore.getState();
      const o = s.geöffnet[kId] ?? s.db[kId];
      return o ? { nodes: o.nodes, edges: o.edges } : undefined;
    },
    resolveInput: async ({ kartenId, nodeId, targetHandleId }) => {
      const g = ctx.getGraph(kartenId);
      if (!g) return { ok: false, error: "Karte nicht gefunden" };
      const e = g.edges.find(e => e.target === nodeId && e.targetHandle === targetHandleId);
      if (!e?.sourceHandle) return { ok: false, error: "kein Eingang", dtype: "unbestimmt" };
      return pull({ kartenId, nodeId: e.source, handleId: e.sourceHandle });
    },
  };

  try {
    const result = await compute(ctx, { kartenId: ref.kartenId, nodeId: ref.nodeId, outHandleId: ref.handleId });
    cache.set(key, result);
    return result;
  } finally {
    inflight.delete(key);
  }
}

/** Reset des Pull-Caches, optional bei harten Änderungen */
export function clearPullCache() {
  cache.clear();
  inflight.clear();
}
