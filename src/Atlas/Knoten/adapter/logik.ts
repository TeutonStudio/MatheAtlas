import type { ComputeFn } from "@/Ordnung/Pull/types";
import type { LogikKnotenDaten } from "@/Atlas/Knoten.types";
import { Fluß, DatenTypen } from "@/Atlas/Anschlüsse.types";
import { Position } from "@xyflow/react";

export const computeLogik: ComputeFn = async (ctx, { kartenId, nodeId }) => {
  const d = ctx.getNodeData<LogikKnotenDaten>(kartenId, nodeId);
  if (!d) return { ok: false, error: "keine Daten" };
  const anschl = d.anschlüsse ?? {};

  // Eingänge in stabiler Reihenfolge: alle target-Handles mit dtype=bool
  const inputs = (Object.values(anschl) as any[][])
    .flat()
    .filter(a => a.fluss === Fluß.Eingang && a.dtype === DatenTypen.Logik);

  // Werte parallel ziehen
  const results = await Promise.all(inputs.map(a =>
    ctx.resolveInput({ kartenId, nodeId, targetHandleId: a.id })
  ));

  if (results.some(r => !r.ok || r.data.dtype !== "bool")) {
    return { ok: false, error: "fehlender/inkompatibler Eingang", dtype: "bool" };
  }
  const vals = results.map(r => (r as any).data.value as boolean);

  let value = false;
  switch (d.variante) {
    case "und":  value = vals.every(Boolean); break;
    case "oder": value = vals.some(Boolean); break;
    case "nicht": value = !vals[0]; break;
    case "dann": value = (!vals[0]) || vals[1]; break;
    default: {
      // Tabellenmodus: binärer Index MSB->LSB
      const idx = vals.reduce((acc, v) => (acc << 1) | (v ? 1 : 0), 0);
      const erg = d.ergebnisse?.[idx] ?? false;
      value = !!erg;
    }
  }

  // Ausgang existiert nur, wenn du ihn gebaut hast. Für Pull ist das egal, wir liefern schlicht den Wert.
  return { ok: true, data: { dtype: "bool", value } };
};
