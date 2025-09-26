import type { ComputeFn, PullResult } from "@/Ordnung/Pull/types";
import type { KartenKnotenDaten, SchnittstellenDaten } from "@/Atlas/Knoten.types";
import { KNOTEN } from "@/Atlas/Karten.types";
import { Fluß } from "@/Atlas/Anschlüsse.types";
import { Node } from "@xyflow/react";

// Kleiner Helper: löst innerhalb der Zielkarte die Schnittstellen-Eingänge auf
async function pullSchnittstelleOutputInZielkarte(ctx: any, zielKartenId: string, schnittId: string): Promise<PullResult> {
  const g = ctx.getGraph(zielKartenId);
  if (!g) return { ok: false, error: "Zielkarte nicht gefunden" };

  // Finde Schnittstellen-Knoten mit passendem handleID und fluss=Ausgang
  const knoten = g.nodes.find((n:Node) => {
    if (n.type !== KNOTEN.Schnittstelle) return false;
    const d = n.data as SchnittstellenDaten | undefined;
    return d?.handleID === schnittId && d.fluss === Fluß.Ausgang;
  });
  if (!knoten) return { ok: false, error: `Schnittstelle „${schnittId}“ (Ausgang) nicht gefunden` };

  // Der Schnittstellen-Knoten hat genau EIN invertiertes Handle, das wir als target ansprechen:
  return ctx.resolveInput({ kartenId: zielKartenId, nodeId: knoten.id, targetHandleId: (knoten.data as any).handleID });
}

export const computeKartenKnoten: ComputeFn = async (ctx, { kartenId, nodeId, outHandleId }) => {
  const d = ctx.getNodeData<KartenKnotenDaten>(kartenId, nodeId);
  if (!d?.karte?.definition?.id) return { ok: false, error: "Zielkarte fehlt" };
  const zielId = d.karte.definition.id;

  // outHandleId entspricht der Basis-ID der Schnittstelle
  const schnittId = outHandleId.split("__")[0]; // robust gegen sufixe
  return pullSchnittstelleOutputInZielkarte(ctx, zielId, schnittId);
};
