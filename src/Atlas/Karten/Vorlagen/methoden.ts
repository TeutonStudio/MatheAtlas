/// ./src/Atlas/Karten/Vorlagen/methoden.ts

import { Position, type Node, type Edge } from "@xyflow/react";

import { KartenDefinition, KNOTEN, type Schnittstelle } from "@/Atlas/Karten.types.ts";
import { DatenTypen, Fluß, Variante, type AnschlussNachSeite } from "@/Atlas/Anschlüsse.types.ts";

import { Anschluss } from "@/Atlas/Knoten/methoden.tsx";
import { erhalteId } from "@/Atlas/Anschlüsse/methoden";


function _knoten(
  id:string,
  type:KNOTEN,
  position:[number,number],
  data:any, 
  anschlüsse?: AnschlussNachSeite
) { 
    return { id, type, position: { x: position[0], y: position[1] }, data: {...data, anschlüsse} }
}

function _basis(
  id: string, 
  position:[number,number], 
  anschlüsse: AnschlussNachSeite, 
  title: string, 
  badge: string,
) { return _knoten("BasisKnotenID:" + id, KNOTEN.Basis, position, { title, badge }, anschlüsse) }

function _latex(
  id: string, 
  position:[number,number], 
  anschlüsse: AnschlussNachSeite, 
  title: string, 
  badge: string,
  LaTeX: string,
) { return _knoten(id, KNOTEN.LaTeX, position, { title, badge, latex: LaTeX }, anschlüsse) }

function _logik(
  id:string,
  position:[number,number], 
  anschlüsse: AnschlussNachSeite, 
  title: string, 
  badge: string,
  ergebnisse:boolean[],
) { return _knoten(id, KNOTEN.LogikTabelle, position, { title, badge, ergebnisse }, anschlüsse) }

function _element(
  id:string,
  position:[number,number],
  def: boolean = false, 
) { return _knoten(id, KNOTEN.Element, position, {objekt: "", menge: "", def}, undefined)}

function _schnittstelle(
    id:string, handleID:string,
    position:[number,number],
    label: string,
    fluss: Fluß,
    dtype: DatenTypen,
    LaTeX?: string,
) { 
    return { 
        id, type: KNOTEN.Schnittstelle, 
        position: { x: position[0], y: position[1] }, 
        data: { label, fluss, dtype, handleID, latex: LaTeX }, 
        deletable: false
    }
}

function _stelle(
    id:string,
    name:string,
    fluss:Fluß,
    datentyp:DatenTypen,
): Schnittstelle { 
    return { 
        id,name,fluss,datentyp,
    } as Schnittstelle;
}


function _karte(
    id:string,
    position:[number,number], 
    karteID: string,
    definition: KartenDefinition,
) {
  return {
    id, type: KNOTEN.KartenKnoten, 
    position: { x: position[0], y: position[1] }, 
    data: { karteID, karte: {definition} },
  }
}


type KantenOpts = {
  sourceIndex?: number; // nur bei Variante.Multi relevant
  targetIndex?: number; // nur bei Variante.Multi relevant
};

function _kante(
  sourceNodeId: string,
  targetNodeId: string,
  datentyp: DatenTypen,
  variante: Variante,
  sourcePortId: string,   // z.B. "E1", "Ao"
  targetPortId: string,   // z.B. "El", "A"
  opts: KantenOpts = {}
): Edge {
  const { sourceIndex, targetIndex } = opts;

  const sh = erhalteId([
    sourcePortId,
    datentyp,
    Fluß.Ausgang,                 // source => Ausgang
    variante,
    variante === Variante.Multi ? (sourceIndex ?? 0) : undefined,
  ]);

  const th = erhalteId([
    targetPortId,
    datentyp,
    Fluß.Eingang,                 // target => Eingang
    variante,
    variante === Variante.Multi ? (targetIndex ?? 0) : undefined,
  ]);

  return {
    id: `e-${sourceNodeId}_${sh}-${targetNodeId}_${th}`,
    source: sourceNodeId,
    target: targetNodeId,
    sourceHandle: sh,
    targetHandle: th,
  };
}


function _anschlüsse() {
    return { 
        [Position.Left]: [
            Anschluss("in1",DatenTypen.Zahl, Fluß.Eingang, Variante.Einzel),
        ],[Position.Right]: [
            Anschluss("out1",DatenTypen.Zahl, Fluß.Ausgang, Variante.Einzel),
        ],
   }
}


function _pos(n:number,m:number): [number,number] { 
    return [n*200,m*150] as const
}

export { 
    _pos,
    _kante,
    _basis,
    _latex,
    _logik,
    _stelle,
    _schnittstelle,
    _anschlüsse,
 }

export const vordefiniert_namensraum = "Knoten Bibliothek"


function Karte(
  pfad:string,
  name:string,
  nodes:Node[],
  edges:Edge[],
  schnittstellen:Schnittstelle[],
  abhaengigkeiten:string[],
  wirdVerwendetIn:string[],
): KartenDefinition {
  function _name(id = false) { return (id ? "bib-" : "")+name+(id ? "-k" : " K")+"noten" }
  const pafdname = pfad+"/"
  
  return {
    id: _name(true),
    name: _name(),
    pfad: vordefiniert_namensraum+"/"+pafdname,
    nodes: nodes,
    edges: edges,
    variablen: [],
    schnittstellen: schnittstellen,
    abhaengigkeiten: abhaengigkeiten,
    wirdVerwendetIn: wirdVerwendetIn,
    scope: "defined",
    userId: "system",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

function LogikKarte(
  name:string,
  nodes:Node[],
  edges:Edge[],
  schnittstellen:Schnittstelle[],
  abhaengigkeiten:string[],
  wirdVerwendetIn:string[],

): KartenDefinition {
  return Karte(
    "logik", name, nodes, edges, schnittstellen, abhaengigkeiten, wirdVerwendetIn
  )
}

export function LogikKarte_einzelarg(
    name:string,
    operation:string,
    tabelle:[boolean,boolean],
    ausgabe: (wert: string) => string,
 ): KartenDefinition {
    const vollerName = "logik-"+name+"-knoten";
    const input = "Eingabe"
    
    return {
        id: "bib-"+vollerName,
        name: "Logik "+name.toUpperCase()+" Knoten",
        pfad: "Knoten Bibliothek/Logik/"+vollerName,
        nodes: [
            _schnittstelle("s1","E1", _pos(0, 2),input, Fluß.Eingang, DatenTypen.Logik),
            _logik("l1",_pos(0,-1),{
              [Position.Bottom]: [
                Anschluss("E", DatenTypen.Logik, Fluß.Eingang, Variante.Einzel),
              ],
              [Position.Top]: [
                Anschluss("A", DatenTypen.Logik, Fluß.Ausgang, Variante.Einzel),
              ],
            }, operation,"Logik",tabelle),
            _schnittstelle("s2","A1", _pos(0, -3), "Ausgabe", Fluß.Ausgang, DatenTypen.Logik, ausgabe(input)),
        ],
        edges: [
            _kante("s1", "l1",DatenTypen.Logik,Variante.Einzel,"E1","E"),
            _kante("l1", "s2",DatenTypen.Logik,Variante.Einzel,"A","A1" ),
        ],variablen: [],
        schnittstellen: [
          _stelle("s1",input,Fluß.Eingang,DatenTypen.Logik),
          _stelle("s2","Ausgabe",  Fluß.Ausgang,DatenTypen.Logik),
        ],
        abhaengigkeiten: [],
        wirdVerwendetIn: [],
        scope: "defined",
        userId: "system",
        createdAt: Date.now(),
        updatedAt: Date.now(),
    } as KartenDefinition
}



export function MengenKarte_doppelarg(
    name:string,
    operation:string,
    karte: string, definition: KartenDefinition,
    ausgabe: (wert1: string, wert2: string) => string,
 ): KartenDefinition {
    const vollerName = "logik-"+name+"-knoten";
    const input1 = "Eingabe A"
    const input2 = "Eingabe B"
    

    return {
        id: "bib-"+vollerName,
        name: "Mengen "+name.toUpperCase()+" Knoten",
        pfad: "Knoten Bibliothek/Mengen/"+vollerName,
        nodes: [
            _schnittstelle("s1","E1", _pos(-1, -1),input1, Fluß.Eingang, DatenTypen.Menge),
            _schnittstelle("s2","E2", _pos(-1, 1), input2, Fluß.Eingang, DatenTypen.Menge),
            _element("e1",_pos(0,-1), false), _element("e2",_pos(0,1), false),
            _element("e3",_pos(1,-2), true),
            _karte("k",_pos(0,-2),karte,definition),
            /*_logik("l1",_pos(0,-2),{
              [Position.Bottom]: [
                Anschluss("El", DatenTypen.Menge, Fluß.Eingang, Variante.Einzel),
                Anschluss("Er", DatenTypen.Menge, Fluß.Eingang, Variante.Einzel),
              ],
              [Position.Top]: [s
                Anschluss("Ao", DatenTypen.Menge, Fluß.Ausgang, Variante.Einzel),
              ],
            }, operation,"Logik",tabelle),*/
            _schnittstelle("s3","A", _pos(0, 3), "Ausgabe", Fluß.Ausgang, DatenTypen.Menge, ausgabe(input1,input2)),
        ],
        edges: [
            _kante("s1", "e1",DatenTypen.Menge,Variante.Einzel,"E1","menge"),
            _kante("s2", "e2",DatenTypen.Menge,Variante.Einzel,"E2","menge"),
            _kante("l1", "s3",DatenTypen.Menge,Variante.Einzel,"Ao","A" ),
        ],variablen: [],
        schnittstellen: [
          _stelle("s1",input1,Fluß.Eingang,DatenTypen.Menge),
          _stelle("s2",input2,Fluß.Eingang,DatenTypen.Menge),
          _stelle("s3","Ausgabe",  Fluß.Ausgang,DatenTypen.Menge),
        ],
        abhaengigkeiten: [
          karte,
        ],
        wirdVerwendetIn: [],
        scope: "defined",
        userId: "system",
        createdAt: Date.now(),
        updatedAt: Date.now(),
    } as KartenDefinition
}

export function LogikKarte_doppelarg(
    name:string,
    operation:string,
    tabelle:[boolean,boolean,boolean,boolean],
    ausgabe: (wert1: string, wert2: string) => string,
 ): KartenDefinition {
    const vollerName = "logik-"+name+"-knoten";
    const input1 = "Eingabe A"
    const input2 = "Eingabe B"

    return {
        id: "bib-"+vollerName,
        name: "Logik "+name.toUpperCase()+" Knoten",
        pfad: "Knoten Bibliothek/Logik/"+vollerName,
        nodes: [
            _schnittstelle("s1","E1", _pos(-1, 1),input1, Fluß.Eingang, DatenTypen.Logik),
            _schnittstelle("s2","E2", _pos(1, 1), input2, Fluß.Eingang, DatenTypen.Logik),
            _logik("l1",_pos(0,-2),{
              [Position.Bottom]: [
                Anschluss("El", DatenTypen.Logik, Fluß.Eingang, Variante.Einzel),
                Anschluss("Er", DatenTypen.Logik, Fluß.Eingang, Variante.Einzel),
              ],
              [Position.Top]: [
                Anschluss("Ao", DatenTypen.Logik, Fluß.Ausgang, Variante.Einzel),
              ],
            }, operation,"Logik",tabelle),
            _schnittstelle("s3","A", _pos(0, -4), "Ausgabe", Fluß.Ausgang, DatenTypen.Logik, ausgabe(input1,input2)),
        ],
        edges: [
            _kante("s1", "l1",DatenTypen.Logik,Variante.Einzel,"E1","El"),
            _kante("s2", "l1",DatenTypen.Logik,Variante.Einzel,"E2","Er"),
            _kante("l1", "s3",DatenTypen.Logik,Variante.Einzel,"Ao","A" ),
        ],variablen: [],
        schnittstellen: [
          _stelle("s1",input1,Fluß.Eingang,DatenTypen.Logik),
          _stelle("s2",input2,Fluß.Eingang,DatenTypen.Logik),
          _stelle("s3","Ausgabe",  Fluß.Ausgang,DatenTypen.Logik),
        ],
        abhaengigkeiten: [],
        wirdVerwendetIn: [],
        scope: "defined",
        userId: "system",
        createdAt: Date.now(),
        updatedAt: Date.now(),
    } as KartenDefinition
}