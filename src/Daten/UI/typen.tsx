/// ./src/Daten/UI/typen.tsx

import {
    zeichneDreieckSkaliert,
    zeichneQuadratSkaliert,
    zeichneKlammernSkaliert,
  } from "@/Daten/UI/Symbole.tsx";
import { DatenTypen } from "@/Atlas/Anschlüsse.types.ts";
  
  
export default function erhalteTypenFarben(typ: DatenTypen, theme: "dark" | "light" | string | undefined): string {
  const niger = theme==="dark"
  switch (typ) {
    case DatenTypen.Unbekannt: return niger ? "#FFFFF5" : "#FFFFF9";
    case DatenTypen.Logik: return niger ? "#FFFFFF" : "#6F6F6F";
    case DatenTypen.Menge: return niger ? "#F59E0B" : "#F59E0B";
    case DatenTypen.Zahl: return niger ? "#3B82F6" : "#3B82F6";
    default: return "";
  }
};

/** Liefert NUR die Form (kein <svg>, keine Farbe). */
export function erhalteSVG(typ: DatenTypen): React.ReactNode {
  switch (typ) {
    case DatenTypen.Logik:
      return zeichneDreieckSkaliert();
    case DatenTypen.Menge:
      return zeichneKlammernSkaliert();
    case DatenTypen.Zahl:
      return zeichneQuadratSkaliert();
    default:
      return null;
  }
};

function erhalteKategorieSymbol(kategorie: string): React.ReactNode | undefined {
  switch (kategorie) {
    case "Logik": return undefined

  }
};
  