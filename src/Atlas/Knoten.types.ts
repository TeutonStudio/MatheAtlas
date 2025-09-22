/// ./src/Atlas/Knoten.types.ts

import type React from "react";
import { type NodeProps } from "@xyflow/react";

import { DatenTypen, Fluß, Variante, isKnownDatenTyp } from "@/Atlas/Anschlüsse.types.ts";
import { type AnschlussNachSeite } from "@/Atlas/Anschlüsse.types.ts";

// Gemeinsame Basis
export type KnotenDaten = {
  title?: string;
  anschlüsse?: AnschlussNachSeite;
};

// Basis = KnotenDaten + Zusatz
export type BasisKnotenDaten = KnotenDaten & {
  badge?: string;
};

// LaTeX = Basis + latex
export type LaTeXKnotenDaten = BasisKnotenDaten & {
  latex?: string;
};

// Definiert die Datenstruktur für einen interaktiven Wahrheitstabellen-Knoten.
// `ergebnisse` speichert den Ausgangswert (wahr/falsch) für jede mögliche
// Kombination der Eingänge. Der Index im Array entspricht der Zeilennummer.
export type LogikTabelleDaten = BasisKnotenDaten & {
  ergebnisse: boolean[];
};

export type SchnittstellenDaten = LaTeXKnotenDaten & {
  label: string;
  fluss: Fluß;
  dtype: DatenTypen;
  handleID:string;
};

export type KartenKnotenDaten = BasisKnotenDaten & {
  karteId: string;
};


// // Gruppen = KnotenDaten + Kinder + Anschlüsse
// export type GruppenKnotenDaten = KnotenDaten & {
//  childTypes?: Array<{ type: Node["type"]; label: string }>;
//  anschlüsse?: AnschlussNachSeite;
//};

// Argumente für gerenderte Knoten
type KnotenArgumente = NodeProps & {
  children?: React.ReactNode;
  selected?: boolean; // redundant, breitgestellt durch NodeProps
  style?: React.CSSProperties;
  // onBadgeClick?: () => void;
};

export type BasisKnotenArgumente = KnotenArgumente & {
  data: BasisKnotenDaten;
};

export type LaTeXKnotenArgumente = KnotenArgumente & {
  data: LaTeXKnotenDaten;
};

export type LogikTabelleArgumente = KnotenArgumente & {
  data: LogikTabelleDaten;
};

export type SchnittstellenArgumente = NodeProps & {
  data: SchnittstellenDaten;
};

export type KartenKnotenArgumente = KnotenArgumente & {
  data: KartenKnotenDaten;
};

// Wenn du später Logik/Gruppen wieder brauchst, baust du analog:
// export type GruppenKnotenArgumente = {
//   node: KnotenArgumente;
//   data: GruppenKnotenDaten;
// };
