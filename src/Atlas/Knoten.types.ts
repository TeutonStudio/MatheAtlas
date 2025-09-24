/// ./src/Atlas/Knoten.types.ts

import type React from "react";
import { type NodeProps } from "@xyflow/react";

import { DatenTypen, Fluß, Variante, type AnschlussNachSeite } from "@/Atlas/Anschlüsse.types.ts";
import { KartenDefinition } from "./Karten.types";
//import { OffeneKarte } from "@/Ordnung/datenbank.types";


/// Daten

export type KnotenDaten = {
  title?: string;
  anschlüsse?: AnschlussNachSeite;
};

export type SchnittstellenDaten = LaTeXKnotenDaten & {
  label: string;
  fluss: Fluß;
  dtype: DatenTypen;
  handleID:string;
};

export type VariableKnotenDaten = LaTeXKnotenDaten & {
  label: string;
  dtype: DatenTypen;
  handleID:string;
};

export type ParameterKnotenDaten = LaTeXKnotenDaten & {
  label: string;
  dtype: DatenTypen;
  handleID:string;
  wert: any;
};

export type KartenKnotenDaten = BasisKnotenDaten & {
  aktiveKarteId: string;
  karte: {definition: KartenDefinition, /*offene: OffeneKarte*/};

};

export type BasisKnotenDaten = KnotenDaten & {
  badge?: string;
};

export type LaTeXKnotenDaten = BasisKnotenDaten & {
  latex?: string;
};

export type LogikTabelleDaten = BasisKnotenDaten & {
  ergebnisse: boolean[];
  eingabeAnzahl: number;
};

export type ElementKnotenDaten = LaTeXKnotenDaten & {
  def: boolean;
  menge:string;
  objekt:string;
}

/// Argumente

type KnotenArgumente = NodeProps & {
  children?: React.ReactNode;
  selected?: boolean;
  style?: React.CSSProperties;
};

export type SchnittstellenArgumente = NodeProps & {
  data: SchnittstellenDaten;
};

export type VariableKnotenArgumente = NodeProps & {
  data: VariableKnotenDaten;
};

export type ParameterKnotenArgumente = NodeProps & {
  data: ParameterKnotenDaten;
}

export type KartenKnotenArgumente = KnotenArgumente & {
  data: KartenKnotenDaten;
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

export type ElementKnotenArgumente = KnotenArgumente & {
  data: ElementKnotenDaten;
}
