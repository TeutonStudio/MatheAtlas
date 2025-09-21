/// ./src/Atlas/Knoten/KartenKnoten.tsx

import { Position, type NodeProps } from "@xyflow/react";

import { useKartenStore } from "@/Ordnung/DatenBank/KartenStore";

import { Anschluss } from "@/Atlas/Knoten/methoden.tsx";
import { AnschlussDefinition, AnschlussNachSeite, Fluß, Variante } from "@/Atlas/Anschlüsse.types.ts";
import { BasisKnotenArgumente, KartenKnotenArgumente, LaTeXKnotenArgumente, LaTeXKnotenDaten } from "@/Atlas/Knoten.types.ts";


import BasisKnoten from "@/Atlas/Knoten/BasisKnoten.tsx";
import LaTeXKnoten from "./LaTeXKnoten";
import { Schnittstelle } from "../Karten.types";

export default function KartenKnoten(argumente: KartenKnotenArgumente) {
  const { id, data } = argumente
  const { findKarte } = useKartenStore();
  const karte = findKarte(data.karteId);

  if (!karte) { return <div>Karte nicht gefunden</div> }

  function gefiltert(_fluss: Fluß) {
    return (karte!.schnittstellen ?? []).filter(s => s.fluss === _fluss);
  };
  function erhalte_anschluss_liste(liste: Schnittstelle[]): AnschlussDefinition[] {
    return liste.map(s => Anschluss(s.id, s.datentyp, s.fluss, Variante.Einzel));
  };

  // Gemeinsame Basis
  const anschlüsse = {
    // TODO Logik Anschlüsse verlegen
    [Position.Left]: erhalte_anschluss_liste(gefiltert(Fluß.Eingang)),
    [Position.Right]: erhalte_anschluss_liste(gefiltert(Fluß.Ausgang)),
  } as AnschlussNachSeite;

  const argument = {
    id, data: { title: karte.name, badge: data.badge, anschlüsse, latex: "\\latex" } as LaTeXKnotenDaten,
  } as LaTeXKnotenArgumente //BasisKnotenArgumente;

  //return <BasisKnoten {...argument} />;
  return <LaTeXKnoten {...argument} />;
}
