import type { ComputeFn } from "@/Ordnung/Pull/types";
import type { ParameterKnotenDaten } from "@/Atlas/Knoten.types";

export const computeParameter: ComputeFn = async (ctx, { kartenId, nodeId }) => {
  const d = ctx.getNodeData<ParameterKnotenDaten>(kartenId, nodeId);
  if (!d) return { ok: false, error: "keine Daten" };
  const dtype = d.dtype;
  if (dtype === "number") return { ok: true, data: { dtype: "number", value: Number(d.wert ?? 0) } };
  if (dtype === "bool")   return { ok: true, data: { dtype: "bool", value: Boolean(d.wert) } };
  if (dtype === "set")    return { ok: true, data: { dtype: "set", value: new Set(d.wert ?? []) } };
  return { ok: true, data: { dtype: "unbestimmt" } };
};
