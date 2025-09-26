import type { ComputeFn } from "@/Ordnung/Pull/types";

const OBJ = "objekt__unbestimmt__target__single";
const SET = "menge__set__target__single";

export const computeElement: ComputeFn = async (ctx, { kartenId, nodeId }) => {
  const obj = await ctx.resolveInput({ kartenId, nodeId, targetHandleId: OBJ });
  const set = await ctx.resolveInput({ kartenId, nodeId, targetHandleId: SET });

  if (!set.ok || set.data.dtype !== "set") return { ok: false, error: "Menge fehlt", dtype: "bool" };
  if (!obj.ok) return { ok: false, error: "Objekt fehlt", dtype: "bool" };

  const inSet = (set.data.value as ReadonlySet<unknown>).has((obj as any).data?.value ?? (obj as any).data);
  return { ok: true, data: { dtype: "bool", value: !!inSet } };
};
