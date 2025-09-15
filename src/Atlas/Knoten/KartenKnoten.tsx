/// ./src/Atlas/Knoten/KartenKnoten.tsx

import { Position, type NodeProps } from "@xyflow/react";

import { useKartenStore } from "@/Ordnung/DatenBank/KartenStore";

import { Anschluss } from "@/Atlas/Knoten/methoden.tsx";
import { AnschlussNachSeite, Fluß, Variante } from "@/Atlas/Anschlüsse.types.ts";
import { BasisKnotenArgumente, KartenKnotenArgumente } from "@/Atlas/Knoten.types.ts";


import BasisKnoten from "@/Atlas/Knoten/BasisKnoten.tsx";

export default function KartenKnoten(argumente: KartenKnotenArgumente) {
  const { id, data } = argumente
  const { findKarte } = useKartenStore();
  const karte = findKarte(data.karteId);

  if (!karte) {
    // Handle case where card is not found
    return <div>Karte nicht gefunden</div>;
  }

  const eingaenge = (karte.schnittstellen ?? []).filter(s => s.fluss === Fluß.Eingang);
  const ausgaenge = (karte.schnittstellen ?? []).filter(s => s.fluss === Fluß.Ausgang);

  const anschlüsse = {
    [Position.Left]: eingaenge.map(s => Anschluss(s.id, s.datentyp, s.fluss, Variante.Einzel)),
    [Position.Right]: ausgaenge.map(s => Anschluss(s.id, s.datentyp, s.fluss, Variante.Einzel)),
  } as AnschlussNachSeite;

  const argument = {
    id, data: { title: karte.name, badge: "Karte", anschlüsse },
  } as BasisKnotenArgumente;

  return <BasisKnoten {...argument} />;
}
