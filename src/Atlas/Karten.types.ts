// ./src/Atlas/Karten.types.ts

import { type Node, type Edge } from "@xyflow/react"

import { DatenTypen, Fluß, Variante } from "@/Atlas/Anschlüsse.types.ts";
//import { type OffeneKarte } from "@/Ordnung/datenbank.types";


export type Lebensraum = "private" | "public" | "defined"

type PaneKontext = { variante: "Pane"; id: string; pos: { x: number; y: number }; onClick?: () => void };
type NodeKontext = { variante: "Node"; id: string; pos: { x: number; y: number }; onClick?: () => void; scope: Lebensraum };
type EdgeKontext = { variante: "Edge"; id: string; pos: { x: number; y: number }; onClick?: () => void; scope: Lebensraum };

export type Kontext = PaneKontext | NodeKontext | EdgeKontext


export type KarteArgumente = {
  hintergrundFarbe?: string;
  controlsLeft?: string;
};



export type Schnittstelle = {
  id: string;
  name: string;
  fluss: Fluß;
  datentyp: DatenTypen;
};

export type Variable = {
  id:string;
  name: string;
  datentyp: DatenTypen;
}


/** NEU: universelle ID + Pfad + Abhängigkeiten */
export type KartenDefinition = {
  id: string;                 // stabil, Referenzen bleiben gültig
  name: string;               // angezeigter Name (umbenennbar)
  pfad: string;               // "./Privat/Gruppe A/Unter/.../name"
  nodes: Node[];              // Inhalt: Knoten
  edges: Edge[];              // Inhalt: Kanten
  schnittstellen: Schnittstelle[]; // Definition der Ein- und Ausgänge
  variablen: Variable[]; // Liste von Variablen, die in dieser Karte verwendet werden
  abhaengigkeiten: string[];  // Liste von Karten-IDs, auf die diese Karte verweist
  wirdVerwendetIn: string[];  // Liste von Karten-IDs, in denen diese Karte verwendet wird
  scope: Lebensraum;
  userId: string | null;      // ID des Besitzers, null für "verwaist" oder "öffentlich"
  createdAt: number;
  updatedAt: number;
};

export enum KNOTEN {
  Basis = "basis",
  LaTeX = "latex",
  Schnittstelle = "schnittstelle",
  Variable = "variable",
  Parameter = "parameter",
  Logik = "logik",
  KartenKnoten = "kartenKnoten",
  Element = "element",
  // Logikvarianten später
}
