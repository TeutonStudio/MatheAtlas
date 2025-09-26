import type { ComputeFn } from "@/Ordnung/Pull/types";
import type { VariableKnotenDaten } from "@/Atlas/Knoten.types";

export const computeVariable: ComputeFn = async (ctx, { kartenId, nodeId }) => {
  const d = ctx.getNodeData<VariableKnotenDaten>(kartenId, nodeId);
  if (!d) return { ok: false, error: "keine Daten" };
  // Variablen produzieren symbolische Terms (Name aus label/handleID)
  const name = String(d.label ?? d.handleID ?? "x");
  return { ok: true, data: { dtype: "term", value: { kind: "sym", name } } };
};
