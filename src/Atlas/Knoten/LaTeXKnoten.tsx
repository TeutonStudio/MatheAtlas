// ./src/Atlas/Knoten/LaTeXKnoten.tsx

// import * as React from "react";
import { Position } from "@xyflow/react";

import {
  // type BasisKnotenDaten,
  type LaTeXKnotenDaten,
//  type KnotenArgumente,
  type LaTeXKnotenArgumente,
  BasisKnotenDaten,
} from "@/Atlas/Knoten.types.ts";
import {
  Fluß, DatenTypen, Variante,
  type AnschlussNachSeite,
} from "@/Atlas/Anschlüsse.types.ts";
import KnotenDebug, { Anschluss, MathRenderer } from "@/Atlas/Knoten/methoden.tsx";

import BasisKnoten from "@/Atlas/Knoten/BasisKnoten.tsx";

export default function LaTeXKnoten(argumente: LaTeXKnotenArgumente) {
  const basis = { 
    title: argumente.data.title, 
    badge: argumente.data.badge, 
    anschlüsse: argumente.data.anschlüsse,
  } as BasisKnotenDaten;

  // BasisKnoten kümmert sich um Titel/Badge/Anschlüsse.
  const argument = {...argumente}; argument.data = basis//{ id, anschlüsse, style, selected, data: basis, zIndex: 4, dragging, draggable, selectable, deletable, type };
  
  if (KnotenDebug) {
    console.log("selektiert LaTeXKnoten",argumente.selected,argumente.id)
    // Debug
  }
  return (
    <BasisKnoten {...argument}>
      <MathRenderer latex={argumente.data.latex} />
    </BasisKnoten>
  );
}

/*
export function TestLaTeXKnoten({ id }: { id: string }) {
  const anschlüsse: AnschlussNachSeite = {
    [Position.Left]: [
      Anschluss("in1", DatenTypen.Menge, Fluß.Eingang, Variante.Einzel),
      Anschluss("inMulti", DatenTypen.Menge, Fluß.Eingang, Variante.Multi),
    ],
    [Position.Right]: [Anschluss("out", DatenTypen.Menge, Fluß.Ausgang, Variante.Einzel)],
    [Position.Bottom]: [Anschluss("multi",DatenTypen.Logik, Fluß.Eingang,Variante.Multi)],
    [Position.Top]: [Anschluss("out_top",DatenTypen.Logik, Fluß.Ausgang, Variante.Einzel)],
  };
  const data: LaTeXKnotenDaten = { title: "LaTeX Knoten", badge: "Minimal", anschlüsse, latex: "A\\lor B" };
  const argumente = {
    id, style: {}, data,
  } as LaTeXKnotenArgumente;

  return <LaTeXKnoten {...argumente} />;
}
*/