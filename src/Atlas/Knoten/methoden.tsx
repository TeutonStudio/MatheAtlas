// ./src/Atlas/Knoten/methoden.ts

import {
    type BasisKnotenDaten,
} from "@/Atlas/Knoten.types.ts";
import {
  type AnschlussNachSeite,
  type AnschlussDefinition,
  Fluß, DatenTypen, Variante,
} from "@/Atlas/Anschlüsse.types.ts";
import { BlockMath, InlineMath } from "react-katex";
import { Badge } from "@/components/ui/badge";

const KnotenDebug = false
export default KnotenDebug

/**
 * Hilfsfunktion zum Erstellen einer sauberen Anschluss-Definition.
 * @param id - Der interne Name des Anschlusses.
 * @param dtype - Der Datentyp des Anschlusses.
 * @param fluss - Die Richtung des Datenflusses (Eingang/Ausgang).
 * @param variante - Die Art des Anschlusses (Einzel/Multi).
 * @returns Ein standardisiertes Anschluss-Props-Objekt.
 */
export function Anschluss(
    id:string,
    dtype: DatenTypen,
    fluss: Fluß,
    variante: Variante,
): AnschlussDefinition {
    return {
        id,
        dtype,
        fluss,
        variante,
    };
}

/**
 * Hilfsfunktion zum Erstellen einer sauberen Anschluss-Definition.
 * @param id - Die Id des Knoten.
 * @param basis - Die Daten des Knoten.
 * @param style - Die style eigenschaften des Knoten.
 * @param children - Der Inhalt des Knoten.
 * @returns Die Argumente des Knoten.
 */
export type KnotenArgumente = {
  id: string;
  basis: BasisKnotenDaten,
  style?: React.CSSProperties;
  selected?: boolean;
  children?: React.ReactNode;
  // onBadgeClick?: () => void;
}


function istKleineFormel(s: string) {
    return s.startsWith("$$") && s.endsWith("$$");
}
function istGroßeFormel(s: string) {
    return s.startsWith("\\[") && s.endsWith("\\]");
}

/**
 * Kleines Helferlein:
 * - erkennt $$...$$ oder \[...\] als Display-Math
 * - alles andere als Inline, aber wir rendern im Block, damit es im Node gut sitzt
 */
export function MathRenderer({ latex }: { latex?: string }) {
  if (!latex || !latex.trim()) {
    return (
      <div style={{ opacity: 0.7, fontStyle: "italic" }}>
        kein LaTeX angegeben
      </div>
    );
  }

  const s = latex.trim();
  const isDisplay = istKleineFormel(s) || istGroßeFormel(s);

  const clean =
    s.startsWith("$$") || s.startsWith("\\[") ? s.slice(2, -2).trim() : s;

  // Wir geben immer blockig aus, weil Nodes sonst zappeln.
  return (
    <div style={{ overflowX: "auto" }}>
      {isDisplay ? <BlockMath math={clean} /> : <BlockMath math={clean} />}
      {/* Wenn du Inline wirklich brauchst:
          isDisplay ? <BlockMath .../> : <InlineMath .../>  */}
    </div>
  );
  return (<InlineMath math={""} />)
}
  

export function KnotenAbzeichen({badge,onBadgeClick}: {
  badge: undefined | string;
  onBadgeClick?: undefined | (() => void);
}) {
  const style = {
    cursor: onBadgeClick ? "pointer" : "default",
    border: "none",
    background: "transparent",
    padding: 0,
  }

  function Abzeichen() {
    return (
      <Badge
        variant="outline"
        className="transition-opacity hover:opacity-80"
      >{badge}</Badge>
    )
  }
  if (badge) {
    return <Abzeichen />;
    return (
      <button
      type="button"
      onClick={onBadgeClick}
      title="Karte öffnen"
      aria-label="Karte öffnen"
      style={style}
    ><Abzeichen /></button>
    )
  }
}
