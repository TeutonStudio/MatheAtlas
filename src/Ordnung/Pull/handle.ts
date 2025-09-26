/// ./src/Ordnung/Pull/handles.ts

import { erhalteAnschluss, ID_TEILE_INDICES } from "@/Atlas/Anschlüsse/methoden";
import type { DType } from "./types";

export function dtypeFromHandle(handleId: string): DType {
  return erhalteAnschluss(handleId)[ID_TEILE_INDICES.TYP] as DType;
}
export function isSource(handleId: string) {
  return erhalteAnschluss(handleId)[ID_TEILE_INDICES.FLUSS] === "source";
}
export function isTarget(handleId: string) {
  return erhalteAnschluss(handleId)[ID_TEILE_INDICES.FLUSS] === "target";
}
export function indexFromHandle(handleId: string): number | undefined {
  const parts = erhalteAnschluss(handleId);
  const raw = parts[ID_TEILE_INDICES.INDEX];
  return raw === undefined ? undefined : Number(raw);
}
