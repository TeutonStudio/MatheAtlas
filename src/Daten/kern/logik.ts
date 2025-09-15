// ./src/Daten/kern/logik.ts

export type Logik = "wahr" | "lüge" | "unentscheidbar";
export type TypTag = "logik" | "zahl" | "menge" | "term" | "unknown";

export type Term =
  | { kind: "sym"; name: string }
  | { kind: "num"; v: number }
  | { kind: "bool"; v: boolean }
  | { kind: "call"; op: string; args: Term[] };

export type Val =
  | { tag: "logik";  value: Logik }
  | { tag: "zahl";   value: number }
  | { tag: "menge";  value: ReadonlySet<unknown> }
  | { tag: "term";   expr: Term }
  | { tag: "unknown" };

export const L = (v: Logik): Val => ({ tag: "logik", value: v });
export const Z = (n: number): Val => ({ tag: "zahl", value: n });
export const M = (xs: Iterable<unknown>): Val => ({ tag:"menge", value: new Set(xs) });
export const T = (t: Term): Val => ({ tag:"term", expr: t });
export const U = (): Val => ({ tag:"unknown" });