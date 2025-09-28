/// ./src/Knoten/BasisKnoten.tsx


import { type BasisKnotenDaten, type BasisKnotenArgumente } from "@/Atlas/Knoten.types.ts";
import KnotenDebug, { type KnotenArgumente } from "@/Atlas/Knoten/methoden.tsx";

import Knoten from "@/Atlas/Knoten/Knoten.tsx";


export default function BasisKnoten(argumente: BasisKnotenArgumente) {
  //const { id, style, selected, data, children } = argumente;
  //const anschlüsse = data.anschlüsse;
  //if (selected) console.log(id+" wurde ausgewählt");
  const styleErsatz = { x: 0, y: 0 } as React.CSSProperties;
  const basis = {...argumente.data} as BasisKnotenDaten;
  const style = argumente.style ?? styleErsatz
  const argument = {...argumente, basis, style} as KnotenArgumente;

  if (KnotenDebug) {
    console.log("selektiert BasisKnoten",argumente.selected,argumente.id)
    // Debug
  }
  return (
    <Knoten {...argument} />
  );
}
