
// ./src/Atlas/Karten/Vorlagem/KartenVorlage.ts

import { type KartenDefinition } from "@Karten.types.ts";

import { _pos, _basis, _latex, _logik, _stelle, _schnittstelle, _kante, _anschlüsse, LogikKarte_einzelarg, LogikKarte_doppelarg, MengenKarte_doppelarg } from "./methoden.ts"
import { disjunktion, konjunktion, negation, subjunktion } from "@/Daten/Formeln/logik.ts";
import { _variable } from "@/Daten/Formeln/LaTeX.ts";

export const vorlageLeer: KartenDefinition = {
  id: "vorlage-leer",
  name: "Leere Karte",
  pfad: "Vorlagen/leer",
  nodes: [],
  edges: [],
  variablen: [],
  schnittstellen: [],
  abhaengigkeiten: [],
  wirdVerwendetIn: [],
  scope: "public",
  userId: "",
//  owner: "system",
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

/*
export const vorlageDemo: KartenDefinition = {
  id: "vorlage-demo",
  name: "Demo Karte",
  pfad: "Vorlagen/demo",
  nodes: [
    _basis("b1",_pos(0,0),_anschlüsse(), "Basis Knoten","Minimal"),
    _basis("b2",_pos(0,1),_anschlüsse(), "Basis Knoten","Minimal"),
    _basis("b3",_pos(0,2),_anschlüsse(), "Basis Knoten","Minimal"),
    _basis("b4",_pos(0,3),_anschlüsse(), "Basis Knoten","Minimal"),
    _latex("l1",_pos(1,0),_anschlüsse(), "LaTeX Knoten","Minimal","\\int\\limits _{0}^{1} x^2 \\mathrm{d} x"),
  ],
  edges: [],
  schnittstellen: [],
  abhaengigkeiten: [],
  wirdVerwendetIn: [],
  scope: "public",
  userId: "",
//  owner: "system",
  createdAt: Date.now(),
  updatedAt: Date.now(),
};*/





// Definition der Knoten-Bibliothek als Record<string, KartenDefinition>
export const knotenBibliothek: Record<string, KartenDefinition> = {
  "logik-nicht": LogikKarte_einzelarg("nicht","Negation",[false,true],(a) => einzelargument(a,negation)),
  "logik-und": LogikKarte_doppelarg("und","Konjunktion",[true,false,false,false],(a,b) => doppelargument(a,b,konjunktion,true)),
  "logik-oder": LogikKarte_doppelarg("oder","Disjunktion",[true,true,true,false],(a,b) => doppelargument(a,b,disjunktion,true)),
  "logik-dann": LogikKarte_doppelarg("dann","Implikation",[true,false,true,true],(a,b) => doppelargument(a,b,subjunktion,false)),

  "mengen-vereinigung": MengenKarte_doppelarg("vereinigung","Vereinigung","bib-logik-oder-knoten",(a,b) => doppelargument(a,b,konjunktion,true)),
  "mengen-schnitt": MengenKarte_doppelarg("schnitt","Schnitt","bib-logik-und-knoten",(a,b) => doppelargument(a,b,konjunktion,true)),
}; export default knotenBibliothek



function einzelargument(
  argument:string,
  formel:(a:string) => string,
) { return formel(_variable(argument)) }

function doppelargument(
  argument1: string,
  argument2: string,
  formel: ((a: string, b: string) => string) | ((a: string[]) => string),
  alsListe: boolean = false
): string {
  const a = _variable(argument1);
  const b = _variable(argument2);

  if (alsListe) {
    // hier ist formel als Listenfunktion bekannt
    return (formel as (x: string[]) => string)([a, b]);
  } else {
    // hier ist formel als Zweiparameterfunktion bekannt
    return (formel as (x: string, y: string) => string)(a, b);
  }
}
