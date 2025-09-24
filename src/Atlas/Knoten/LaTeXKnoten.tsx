/// ./src/Atlas/Knoten/LaTeXKnoten.tsx


import { type LaTeXKnotenArgumente, type BasisKnotenDaten } from "@/Atlas/Knoten.types.ts";
import KnotenDebug, { MathRenderer } from "@/Atlas/Knoten/methoden.tsx";

import BasisKnoten from "@/Atlas/Knoten/BasisKnoten.tsx";

export default function LaTeXKnoten(argumente: LaTeXKnotenArgumente) {
  const basis = { 
    title: argumente.data.title, 
    badge: argumente.data.badge, 
    anschlüsse: argumente.data.anschlüsse,
  } as BasisKnotenDaten;

  // BasisKnoten kümmert sich um Titel/Badge/Anschlüsse.
  const latex = argumente.data.latex ?? "\\LaTeX"
  const argument = {...argumente}; argument.data = basis//{ id, anschlüsse, style, selected, data: basis, zIndex: 4, dragging, draggable, selectable, deletable, type };
  
  if (KnotenDebug) {
    console.log("selektiert LaTeXKnoten",argumente.selected,argumente.id)
    // Debug
  }
  return (
    <BasisKnoten {...argument}>
      <MathRenderer latex={latex==="" ? "\\latex" : latex} />
    </BasisKnoten>
  );
}
