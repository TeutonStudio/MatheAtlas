// ./src/Ordnung/Graph/utils.ts

import { type Node, type Edge } from "@xyflow/react";
import { KNOTEN } from "@/Atlas/Karten.types";

export function getIncomingEdges(edges: Edge[], nodeId: string) {
  return edges.filter(e => e.target === nodeId);
}
export function getSourceNodeIds(incoming: Edge[]) {
  return incoming.map(e => e.source);
}
export function getNodeMap(nodes: Node[]) {
  const map = new Map<string, Node>();
  nodes.forEach(n => map.set(n.id, n));
  return map;
}

export function getUpstreamNodes(nodes: Node[], edges: Edge[], startId: string): Node[] {
  const map = getNodeMap(nodes);
  const visited = new Set<string>();
  const stack = [startId];
  const result: Node[] = [];

  while (stack.length) {
    const cur = stack.pop()!;
    if (visited.has(cur)) continue;
    visited.add(cur);
    const incoming = getIncomingEdges(edges, cur);
    for (const e of incoming) {
      const src = map.get(e.source);
      if (src && !visited.has(src.id)) {
        result.push(src);
        stack.push(src.id);
      }
    }
  }
  return result;
}

export function upstreamContainsType(up: Node[], type: KNOTEN) {
  return up.some(n => n.type === type);
}

export function collectByType<T = Node>(up: Node[], type: KNOTEN): Node[] {
  return up.filter(n => n.type === type);
}

export function uniqueBy<T>(arr: T[], key: (t: T) => string) {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const x of arr) {
    const k = key(x);
    if (!seen.has(k)) {
      seen.add(k);
      out.push(x);
    }
  }
  return out;
}

export function sortBy<T>(arr: T[], key: (t: T) => string) {
  return [...arr].sort((a, b) => key(a).localeCompare(key(b), undefined, { numeric: true }));
}
