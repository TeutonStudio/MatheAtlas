// ./src/Knoten/BasisKnoten.tsx

// import * as React from "react";
import { Position } from "@xyflow/react";


import {
  type BasisKnotenDaten,
  //type KnotenArgumente,
  type BasisKnotenArgumente
} from "@/Atlas/Knoten.types.ts";
import {
  type AnschlussNachSeite,
  Fluß, DatenTypen, Variante,
} from "@/Atlas/Anschlüsse.types.ts";
import { type KnotenArgumente, Anschluss } from "@/Atlas/Knoten/methoden.tsx";

import Knoten from "@/Atlas/Knoten/Knoten.tsx";


export default function BasisKnoten(argumente: BasisKnotenArgumente) {
  const { id, style, selected, data, children } = argumente;
  const anschlüsse = data.anschlüsse;
  if (selected) console.log(id+" wurde ausgewählt");
  const styleErsatz = { x: 0, y: 0 } as React.CSSProperties;
  const basis = { title: data.title, badge: data.badge, anschlüsse } as BasisKnotenDaten;
  const argument = {id, basis, style: style ?? styleErsatz, selected, children} as KnotenArgumente;

  return (
    <Knoten {...argument} />
  );
}

/** Dev-Helfer zum schnellen Testen im Canvas */
export function TestBasisKnoten({ id }: { id: string }) {
  const anschlüsse = {
    [Position.Left]: [
      Anschluss("in1", DatenTypen.Logik, Fluß.Eingang, Variante.Einzel),
      Anschluss("leftMulti", DatenTypen.Logik, Fluß.Eingang, Variante.Multi),
    ],
    [Position.Right]: [
      Anschluss("out1", DatenTypen.Logik, Fluß.Ausgang, Variante.Einzel),
      Anschluss("rightMulti", DatenTypen.Logik, Fluß.Eingang, Variante.Multi),
    ],
    [Position.Top]: [Anschluss("topMulti", DatenTypen.Logik, Fluß.Eingang, Variante.Multi)],
    [Position.Bottom]: [Anschluss("bottomMulti", DatenTypen.Logik, Fluß.Eingang, Variante.Multi)],
  } as AnschlussNachSeite;
  
  const data = { title: "BasisKnoten", badge: "Minimal", anschlüsse } as BasisKnotenDaten;
  const argumente = { 
    id, data,
    style: {},
    selected: false,
    children: undefined,
  } as BasisKnotenArgumente;
  
  
  return <BasisKnoten {...argumente}/>;
  
  //return (<>{ BasisKnoten({ id, anschlüsse, style: undefined, selected: false, data, children: undefined  }) }</>)
  //return <BasisKnoten node={node} data={data} />;
}
