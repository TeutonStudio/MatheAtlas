// ./src/Ordnung/Pull/registry.ts

import { KNOTEN } from "@/Atlas/Karten.types";
import type { ComputeFn } from "./types";

import { computeParameter } from "@/Atlas/Knoten/adapter/parameter";
import { computeVariable } from "@/Atlas/Knoten/adapter/variable";
import { computeSchnittstelle } from "@/Atlas/Knoten/adapter/schnittstelle";
import { computeElement } from "@/Atlas/Knoten/adapter/element";
import { computeLogik } from "@/Atlas/Knoten/adapter/logik";
import { computeAuswertung } from "@/Atlas/Knoten/adapter/auswertung";
import { computeKartenKnoten } from "@/Atlas/Knoten/adapter/kartenknoten";

export const registry: Record<KNOTEN, ComputeFn> = {
  [KNOTEN.Basis]: async () => ({ ok: false, error: "Basis hat keinen Compute" }),
  [KNOTEN.LaTeX]: async () => ({ ok: false, error: "LaTeX hat keinen Compute" }),
  [KNOTEN.Schnittstelle]: computeSchnittstelle,
  [KNOTEN.Variable]: computeVariable,
  [KNOTEN.Parameter]: computeParameter,
  [KNOTEN.KartenKnoten]: computeKartenKnoten,
  [KNOTEN.Logik]: computeLogik,
  [KNOTEN.Element]: computeElement,
  [KNOTEN.Auswertung]: computeAuswertung,
  [KNOTEN.Rechen]: async () => ({ ok: false, error: "RechenKnoten noch nicht implementiert" }),
};
