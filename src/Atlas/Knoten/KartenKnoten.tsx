/// ./src/Atlas/Knoten/KartenKnoten.tsx

import { Position } from "@xyflow/react";


import KnotenDebug, { Anschluss } from "@/Atlas/Knoten/methoden.tsx";
import { type AnschlussDefinition, type AnschlussNachSeite, DatenTypen, Fluß, Variante } from "@/Atlas/Anschlüsse.types.ts";
import { type KartenKnotenArgumente, type LaTeXKnotenArgumente, type LaTeXKnotenDaten } from "@/Atlas/Knoten.types.ts";
import { type Schnittstelle } from "../Karten.types";


import LaTeXKnoten from "./LaTeXKnoten";
//import {  } from "@/Atlas/Knoten.types";

export default function KartenKnoten(argumente: KartenKnotenArgumente) {
  const { id, selected, data } = argumente
  //const { findKarte, aktiveKarteId, openFromKartenKnoten } = useKartenStore();
  //const karte = findKarte(data.karteId);
  const karte = data.karte.definition

  if (!karte) { return <div>Karte nicht gefunden</div> }

  function gefiltert(_fluss: Fluß, logik: boolean = false) {
    return (karte.schnittstellen ?? []).filter((s: Schnittstelle) => {
      const validerFluss = s.fluss === _fluss;
      const validerDTyp = logik? s.datentyp === DatenTypen.Logik : s.datentyp !== DatenTypen.Logik;
      return validerFluss && validerDTyp;
    });
  };
  function erhalte_anschluss_liste(liste: Schnittstelle[]): AnschlussDefinition[] {
    return liste.map(s => Anschluss(s.id, s.datentyp, s.fluss, Variante.Einzel));
  };
  
  // Gemeinsame Basis
  const anschlüsse = {
    // TODO Logik Anschlüsse verlegen
    [Position.Top]: erhalte_anschluss_liste(gefiltert(Fluß.Ausgang,true)),
    [Position.Bottom]: erhalte_anschluss_liste(gefiltert(Fluß.Eingang,true)),
    [Position.Left]: erhalte_anschluss_liste(gefiltert(Fluß.Eingang)),
    [Position.Right]: erhalte_anschluss_liste(gefiltert(Fluß.Ausgang)),
  } as AnschlussNachSeite;
  /*const onBadgeClick = () => {
      //if (!aktiveKarteId) return;
      openFromKartenKnoten(data.aktiveKarteId, karte.id);
    }*/
  
  const argument = {
    id, selected, data: { title: karte.name, badge: data.badge, anschlüsse, latex: "\\LaTeX" } as LaTeXKnotenDaten,
  } as LaTeXKnotenArgumente //BasisKnotenArgumente;
  
  if (KnotenDebug) {
    console.log("selektiert KartenKnoten",argumente.selected,argumente.id)
    // Debug
  }
  return <LaTeXKnoten {...argument} />;
}
