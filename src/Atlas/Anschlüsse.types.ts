// ./src/Atlas/Anschlüsse.types.ts

import { type Position } from "@xyflow/react";

// Core Enums for Handle classification
export enum DatenTypen {
  Logik = "bool",
  Menge = "set",
  Zahl = "number",
}

export enum Fluß {
  Eingang = "target",
  Ausgang = "source",
}

export enum Variante {
  Einzel = "single",
  Multi = "multi",
}


// Definiert einen handle (oder alle des MultiAnschluss)
// This is the source of truth for creating handles in AnschlussLeiste.
export type AnschlussDefinition = {
  id: string; // Unique identifier for the handle within the node
  dtype: DatenTypen;
  fluss: Fluß;
  variante: Variante;

  // Optional properties for Multi-handles
  gapPx?: number;
  radiusPx?: number;
};

// Defines the layout of handles on all sides of a node.
export type AnschlussNachSeite = Partial<Record<Position, AnschlussDefinition[]>>;


export type DatenAnschlussArgumente = {
  handleId: string;
  position: Position;
  fluss: Fluß;
  datenTyp: DatenTypen;
  leftPct?: number;
  topPct?: number;
  style?: React.CSSProperties;
};


// Props for the component that lays out all handles on one side of a node.
export type AnschlussLeisteArgumente = {
  nodeId?: string; // Optional, as it can be retrieved from React Flow context
  seite: Position;
  anschlussListe: (pos: Position) => AnschlussDefinition[];
  edgePaddingPct?: number;
};

// --- Utility Functions ---

export function isKnownDatenTyp(x: string): boolean {
  return (Object.values(DatenTypen) as string[]).includes(x);
}
