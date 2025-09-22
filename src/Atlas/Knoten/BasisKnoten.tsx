/// ./src/Knoten/BasisKnoten.tsx


import {
  type BasisKnotenDaten,
  //type KnotenArgumente,
  type BasisKnotenArgumente
} from "@/Atlas/Knoten.types.ts";
import KnotenDebug, { type KnotenArgumente } from "@/Atlas/Knoten/methoden.tsx";

import Knoten from "@/Atlas/Knoten/Knoten.tsx";


export default function BasisKnoten(argumente: BasisKnotenArgumente) {
  const { id, style, selected, data, children } = argumente;
  const anschlüsse = data.anschlüsse;
  if (selected) console.log(id+" wurde ausgewählt");
  const styleErsatz = { x: 0, y: 0 } as React.CSSProperties;
  const basis = { title: data.title, badge: data.badge, anschlüsse } as BasisKnotenDaten;
  const argument = {id, basis, style: style ?? styleErsatz, selected, children} as KnotenArgumente;

  if (KnotenDebug) {
    console.log("selektiert BasisKnoten",selected,id)
    // Debug
  }
  return (
    <Knoten {...argument} />
  );
}
