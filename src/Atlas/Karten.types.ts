
// ./src/Karten/Karte.types.ts
import { type NodeTypes, type Node, type Edge, type OnNodesChange, type OnEdgesChange, type OnConnect } from "@xyflow/react"

import { DatenTypen, Fluß } from "@/Atlas/Anschlüsse.types.ts";

import BasisKnoten from "@/Atlas/Knoten/BasisKnoten.tsx";
import LaTeXKnoten from "@/Atlas/Knoten/LaTeXKnoten.tsx"
import SchnittstellenKnoten from "@/Atlas/Knoten/SchnittstellenKnoten.tsx";
import KartenKnoten from "@/Atlas/Knoten/KartenKnoten.tsx";
import LogikTabelleKnoten from "@/Atlas/Knoten/LogikTabelleKnoten.tsx";


export type Lebensraum = "private" | "public" | "defined"

type PaneKontext = { variante: "Pane"; pos: { x: number; y: number }; scope: Lebensraum; onClick?: () => void };
type NodeKontext = { variante: "Node"; id: string; pos: { x: number; y: number }; scope: Lebensraum; onClick?: () => void };
type EdgeKontext = { variante: "Edge"; id: string; pos: { x: number; y: number }; scope: Lebensraum; onClick?: () => void };

export type Kontext = PaneKontext | NodeKontext | EdgeKontext


export type KarteArgumente = {
  nodes: Node[];
  edges: Edge[]; 
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  hintergrundFarbe?: string;
  // Prop für die dynamische X-position der Controls, abhängig vom Sidebar-Status
  controlsLeft?: string;
  scope: Lebensraum;
};

export type Schnittstelle = {
  id: string;
  name: string;
  fluss: Fluß;
  datentyp: DatenTypen;
};


/** NEU: universelle ID + Pfad + Abhängigkeiten */
export type KartenDefinition = {
  id: string;                 // stabil, Referenzen bleiben gültig
  name: string;               // angezeigter Name (umbenennbar)
  pfad: string;               // "./Privat/Gruppe A/Unter/.../name"
  nodes: Node[];              // Inhalt: Knoten
  edges: Edge[];              // Inhalt: Kanten
  schnittstellen: Schnittstelle[]; // Definition der Ein- und Ausgänge
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
  KartenKnoten = "kartenKnoten",
  LogikTabelle = "logiktabelle"
  // Logikvarianten später
}

export const KnotenVarianten: NodeTypes = {
  [KNOTEN.Basis]: BasisKnoten,
  [KNOTEN.LaTeX]: LaTeXKnoten,
  [KNOTEN.Schnittstelle]: SchnittstellenKnoten,
  [KNOTEN.KartenKnoten]: KartenKnoten,
  [KNOTEN.LogikTabelle]: LogikTabelleKnoten,
};
