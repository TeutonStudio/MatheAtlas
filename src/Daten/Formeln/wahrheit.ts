// ./src/Daten/Formeln/wahrheit.ts

import { type Logik } from "@/Daten/kern/logik.ts";
import { lüge, wahr, unentscheidbar } from "@/Daten/Formeln/logik";

export type Logik3 = Logik; // "wahr" | "lüge" | "unentscheidbar"
export type TruthRow = { a: Logik3; b: Logik3; out: Logik3 };
export type TruthTable2 = TruthRow[];

/** Hilfsfunktionen, um Logik -> LaTeX farbig zu mappen */
export function logikToLatex(v: Logik3): string {
  switch (v) {
    case "wahr": return wahr();
    case "lüge": return lüge();
    case "unentscheidbar": return unentscheidbar();
  }
}

/** Baut eine LaTeX-Align-Umgebung für eine 2x2-Tabelle (oder 3-wertig, wenn du willst) */
export function truthTableToAlign(
  table: TruthTable2,
  labelA = "Eingang 1",
  labelB = "Eingang 2",
  labelOut = "Ausgang"
): string {
  const header = `\\text{${labelA}} && \\text{${labelB}} && \\text{${labelOut}} \\\\`;
  const rows = table
    .map(r => `${logikToLatex(r.a)} && ${logikToLatex(r.b)} && ${logikToLatex(r.out)} \\\\`)
    .join("\n");

  return [
    "\\begin{align}",
    header,
    rows.trimEnd().replace(/\\\\$/,""),
    "\\end{align}"
  ].join("\n");
}

/** Pure Evaluationsfunktion: liest A,B und liefert out gemäß Tabelle. */
export function evalTruthTable(table: TruthTable2, a: Logik3, b: Logik3): Logik3 {
  const hit = table.find(r => r.a === a && r.b === b);
  return hit ? hit.out : "unentscheidbar";
}

/** Bequeme Voreinstellung: klassisches OR für zweiwertige Logik */
export const TABLE_OR_2W: TruthTable2 = [
  { a: "wahr", b: "wahr", out: "wahr" },
  { a: "lüge", b: "wahr", out: "wahr" },
  { a: "wahr", b: "lüge", out: "wahr" },
  { a: "lüge", b: "lüge", out: "lüge" },
];