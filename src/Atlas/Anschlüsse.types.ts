// ./src/Atlas/Anschlüsse.types.ts

import { type Position } from "@xyflow/react";

// Core Enums for Handle classification
export enum DatenTypen {
  Unbekannt = "unbestimmt",
  Logik = "bool",
  Menge = "set",
  Zahl = "number",
  Term = "term",
}

export enum Fluß {
  Eingang = "target",
  Ausgang = "source",
}

export enum Variante {
  Einzel = "single",
  Multi = "multi",
}

export type AnschlussDefinition = {
  id: string;
  dtype: DatenTypen;
  fluss: Fluß;
  variante: Variante;
  gapPx?: number;
  radiusPx?: number;
};
export type EingangsDefinition = AnschlussDefinition & {fluss: Fluß.Eingang}
export type AusgangsDefinition = AnschlussDefinition & {fluss: Fluß.Ausgang}

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

export type AnschlussLeisteArgumente = {
  nodeId?: string;
  seite: Position;
  anschlussListe: (pos: Position) => AnschlussDefinition[];
  edgePaddingPct?: number;
};

// NEU: Props für MultiAnschlussLeiste (explizit, damit überall konsistent)
export type MultiAnschlussLeisteArgumente = {
  nodeId: string;
  position: Position;
  definition: EingangsDefinition;
  handleIds: string[];
  topPct?: number;
  leftPct?: number;
  widthPct?: number;
  heightPct?: number;
};

// Utility
export function isKnownDatenTyp(x: string): boolean {
  return (Object.values(DatenTypen) as string[]).includes(x);
}
