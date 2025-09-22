// ./src/Atlas/Knoten/SchnittstellenKnoten.tsx

// import { KnotenProps } from "@xyflow/react";
// import { useKartenStore } from "@/Daten/kern/store";

//import { KarteVorlage } from "@/Ordnung/programm.types.ts";
import { DatenTypen, Fluß, Variante, isKnownDatenTyp, type AnschlussNachSeite } from "@/Atlas/Anschlüsse.types.ts";
import { type SchnittstellenDaten, type SchnittstellenArgumente, type BasisKnotenDaten, LaTeXKnotenArgumente, LaTeXKnotenDaten } from "@/Atlas/Knoten.types.ts";
import { Anschluss, type KnotenArgumente } from "@/Atlas/Knoten/methoden.tsx";

import Knoten from "@/Atlas/Knoten/Knoten.tsx";
import { Position } from "@xyflow/react";
import LaTeXKnoten from "./LaTeXKnoten";

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
  const anschlüsse = {
    [seite]: [Anschluss(argumente.data.handleID,argumente.data.dtype,invertFluß(fluss),Variante.Einzel)], 
  } as AnschlussNachSeite;
  const data = { ...argumente.data, badge, anschlüsse, latex: argumente.data.latex ?? "\\LaTeX" } as LaTeXKnotenDaten;
//  console.log("Formel: ",data.latex)
  
  const argument = {
    ...argumente, data
  } as LaTeXKnotenArgumente

  return <LaTeXKnoten {...argument} />
}
