// ./src/Atlas/Knoten/SchnittstellenKnoten.tsx

import { Position } from "@xyflow/react";

import { DatenTypen, Fluß, Variante, type AnschlussNachSeite } from "@/Atlas/Anschlüsse.types.ts";
import { LaTeXKnotenArgumente, LaTeXKnotenDaten, type SchnittstellenArgumente } from "@/Atlas/Knoten.types.ts";
import { Anschluss, invertFluß, istEingang, istVertikal } from "@/Atlas/Knoten/methoden.tsx";

import LaTeXKnoten from "@/Atlas/Knoten/LaTeXKnoten";

export default function SchnittstellenKnoten(argumente: SchnittstellenArgumente) {
  //const { id, selected, /*style*/ } = argumente;
  const fluss = argumente.data.fluss
  const dtype = argumente.data.dtype 
  const seite = istEingang(
    istVertikal(Position.Top,Position.Right,dtype),
    istVertikal(Position.Bottom,Position.Left,dtype),
    fluss
  );

  const badge = istEingang("Eingabe","Ausgabe",fluss)
  function anschlussName() {
    const ausgabe = argumente.data.handleID ?? argumente.data.title;
    return ausgabe==="" ? "Hafen" : ausgabe;
  };
  const anschlüsse = {
    [seite]: [Anschluss(anschlussName(),argumente.data.dtype,invertFluß(fluss),Variante.Einzel)], 
  } as AnschlussNachSeite;
  const data = {...argumente.data, badge, anschlüsse, latex: argumente.data.latex} as LaTeXKnotenDaten;
  const argument = {...argumente, data } as LaTeXKnotenArgumente;
  return <LaTeXKnoten {...argument} />;
}
