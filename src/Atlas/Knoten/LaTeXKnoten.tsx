/// ./src/Atlas/Knoten/LaTeXKnoten.tsx


import { type LaTeXKnotenArgumente, type BasisKnotenDaten } from "@/Atlas/Knoten.types.ts";
import KnotenDebug, { MathRenderer } from "@/Atlas/Knoten/methoden.tsx";

import BasisKnoten from "@/Atlas/Knoten/BasisKnoten.tsx";
import { _latex } from "@/Daten/Formeln/LaTeX";

export default function LaTeXKnoten(argumente: LaTeXKnotenArgumente) {
  // BasisKnoten kümmert sich um Titel/Badge/Anschlüsse.
  const latex = argumente.data.latex ?? _latex
  const data = {...argumente.data} as BasisKnotenDaten;
  const argument = {...argumente, data}; 
  
  if (KnotenDebug) {
    console.log("selektiert LaTeXKnoten",argumente.selected,argumente.id)
    // Debug
  }
  return (
    <BasisKnoten {...argument}>
      <MathRenderer latex={latex==="" ? _latex : latex} />
    </BasisKnoten>
  );
}
