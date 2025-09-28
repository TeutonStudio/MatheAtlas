/// ./src/Daten/Formeln/parameter.ts

import { DatenTypen } from "@/Atlas/Anschlüsse.types";
import { wahr, lüge } from "@/Daten/Formeln/logik";
import { LeereMenge, Mengen } from "@/Daten/Formeln/mengen";
import { _farbig, _latex } from "./LaTeX";

export type LogikToken = "wahr" | "lüge";
export type MengenToken = "leer" | "N" | "Z" | "Q" | "R" | "C";

export function parameterZuLatex(dtype: DatenTypen, wert: any): string {
  switch (dtype) {
    case DatenTypen.Logik:
      return (wert as LogikToken) === "wahr" ? wahr() : lüge();

    case DatenTypen.Menge: {
      const t = wert as MengenToken;
      if (t === "leer") return LeereMenge;
      return Mengen(t); // nutzt deine gefixte \mathbb{...}-Funktion
    }

    case DatenTypen.Zahl: {
      const n = Number.isFinite(Number(wert)) ? String(wert) : "0";
      return n; // Zahlen müssen nicht extra eingerahmt werden
    }

    case DatenTypen.Term: {
      return "x\\mapsto x"
    }

    default:
      return _farbig("gray",_latex); // "\\color{gray}{\\text{unbestimmt}}";
  }
}
