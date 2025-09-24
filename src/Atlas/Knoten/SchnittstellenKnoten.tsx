// ./src/Atlas/Knoten/SchnittstellenKnoten.tsx

import { Position } from "@xyflow/react";

import { DatenTypen, Fluß, Variante, type AnschlussNachSeite } from "@/Atlas/Anschlüsse.types.ts";
import { LaTeXKnotenArgumente, LaTeXKnotenDaten, type SchnittstellenArgumente } from "@/Atlas/Knoten.types.ts";
import { Anschluss } from "@/Atlas/Knoten/methoden.tsx";

import LaTeXKnoten from "@/Atlas/Knoten/LaTeXKnoten";

type Aussage = undefined | string | Position

function _if(bed:boolean,falls: Aussage,nicht:Aussage): any | string | boolean {
  return bed ? (falls ?? true) : (nicht ?? false)
};

export default function SchnittstellenKnoten(argumente: SchnittstellenArgumente) {
  //const { id, selected, /*style*/ } = argumente;
  const fluss = argumente.data.fluss
  const dtype = argumente.data.dtype
  
  function istEingang(falls?: Aussage,nicht?: Aussage): boolean | string | any { 
    return _if(fluss === Fluß.Eingang,falls,nicht) 
  };
  function istVertikal(falls?: Aussage,nicht?: Aussage): boolean | string | any { 
    return _if(dtype === DatenTypen.Logik,falls,nicht) 
  };
  function invertFluß(_fluss:Fluß): Fluß {
    return _fluss === Fluß.Eingang ? Fluß.Ausgang : Fluß.Eingang
  };

  const seite = istEingang(
    istVertikal(Position.Top,Position.Right),
    istVertikal(Position.Bottom,Position.Left),
  );
  
  const badge = istEingang("Eingabe","Ausgabe")
  function anschlussName() {
    const ausgabe = argumente.data.handleID ?? argumente.data.title;
    return ausgabe==="" ? "Hafen" : ausgabe;
  };
  const anschlüsse = {
    [seite]: [Anschluss(anschlussName(),argumente.data.dtype,invertFluß(fluss),Variante.Einzel)], 
  } as AnschlussNachSeite;
  const data = {...argumente.data, badge, anschlüsse, latex: argumente.data.latex} as LaTeXKnotenDaten;
  
  const argument = {...argumente, data } as LaTeXKnotenArgumente
  return <LaTeXKnoten {...argument} />
}
