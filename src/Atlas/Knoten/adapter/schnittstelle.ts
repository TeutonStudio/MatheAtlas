import type { ComputeFn } from "@/Ordnung/Pull/types";
import type { SchnittstellenDaten } from "@/Atlas/Knoten.types";
import { Fluß } from "@/Atlas/Anschlüsse.types";

export const computeSchnittstelle: ComputeFn = async (ctx, { kartenId, nodeId }) => {
  const d = ctx.getNodeData<SchnittstellenDaten>(kartenId, nodeId);
  if (!d) return { ok: false, error: "keine Daten" };

  // Schnittstellen-Knoten haben genau EIN Gegen-Handle mit invertiertem Fluss (du erzeugst ihn in der Komponente)
  // Für Ausgänge ziehen wir den verbundenen Eingang (am Schnittstellen-Knoten ist der Handle der invertierten Richtung)
  const handleId = d.handleID;
  if (!handleId) return { ok: false, error: "fehlende handleID" };

  if (d.fluss === Fluß.Ausgang) {
    // Unser Knoten präsentiert einen Ausgang nach außen, intern wird der Eingang gepullt:
    return ctx.resolveInput({ kartenId, nodeId, targetHandleId: handleId });
  } else {
    // Eingabe-Schnittstelle hat nach außen keinen Output
    return { ok: false, error: "Eingabe-Schnittstelle hat keinen Ausgang", dtype: d.dtype as any };
  }
};
