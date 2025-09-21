// /src/Daten/UI/typen.tsx

import {
    zeichneDreieckSkaliert,
    zeichneQuadratSkaliert,
    zeichneKlammernSkaliert,
  } from "@/Daten/UI/Symbole.tsx";
import { DatenTypen } from "@/Atlas/Anschlüsse.types.ts";
  
  
export const typenFarben: Record<DatenTypen, Record<"dark" | "light", string>> = {
  [DatenTypen.Logik]: {["dark"]:"#FFFFFF", ["light"]:"#6F6F6F"},
  [DatenTypen.Menge]: {["dark"]:"#f59e0b", ["light"]:""},
  [DatenTypen.Zahl]:  {["dark"]:"#3b82f6", ["light"]:""},
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

export function erhalteKategorieSymbol(kategorie: string): React.ReactNode | undefined {
  switch (kategorie) {
    case "Logik": return undefined

  }
};
  