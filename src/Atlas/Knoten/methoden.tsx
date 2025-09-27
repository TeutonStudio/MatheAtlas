// ./src/Atlas/Knoten/methoden.ts

import * as React from "react";
import { Position, type Node, type Edge } from "@xyflow/react";

import { BlockMath, InlineMath } from "react-katex";
import { useShallow } from "zustand/react/shallow";
import shallow from "zustand/shallow";

import { Badge } from "@/components/ui/badge";

import { useKartenStore } from "@/Ordnung/DatenBank/KartenStore";
import { KartenState } from "@/Ordnung/datenbank.types";


import { type Daten, type BasisKnotenDaten } from "@/Atlas/Knoten.types.ts";
import { Fluß, DatenTypen, Variante, type AnschlussDefinition, AnschlussNachSeite } from "@/Atlas/Anschlüsse.types.ts";

const KnotenDebug = false;
export default KnotenDebug;

type Aussage = undefined | string | Position
type Ausgabe = boolean | string | any

export function _if(bed:boolean,falls: Aussage,nicht:Aussage): Ausgabe {
  return bed ? (falls ?? true) : (nicht ?? false)
};
export function istEingang(falls: Aussage,nicht: Aussage, fluss: Fluß): Ausgabe { 
  return _if(fluss === Fluß.Eingang,falls,nicht) 
};
export function istVertikal(falls: Aussage,nicht: Aussage, dtype: DatenTypen): Ausgabe { 
  return _if(dtype === DatenTypen.Logik,falls,nicht) 
};
export function invertFluß(_fluss:Fluß): Fluß {
  return _fluss === Fluß.Eingang ? Fluß.Ausgang : Fluß.Eingang
};


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
  //return (<InlineMath math={""} />)
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
    /*return (
      <button
      type="button"
      onClick={onBadgeClick}
      title="Karte öffnen"
      aria-label="Karte öffnen"
      style={style}
    ><Abzeichen /></button>
    )*/
  }
}

/** Alle möglichen Permutationen für n Eingänge */
export const erzeugePermutationen = (n: number): boolean[][] => {
  if (n <= 0) return [[]];
  const perms: boolean[][] = [];
  const anzahlZeilen = 1 << n;
  for (let i = 0; i < anzahlZeilen; i++) {
    const zeile: boolean[] = [];
    for (let j = n - 1; j >= 0; j--) {
      zeile.push(((i >> j) & 1) === 0);
    }
    perms.push(zeile);
  }
  return perms;
};


/**
 * Liefert die Daten-Referenzen aller Quellen, die auf `nodeId` zeigen.
 * Verglichen wird per shallow über den useShallow-Wrapper (kein equalityFn-Param mehr).
 */
export function useEingangsDaten(nodeId: string): Daten[] {
  const { dataRefs } = useKartenStore(
    useShallow((s: KartenState) => {
      const kId = s.aktiveKarteId ?? null;
      const offene = kId ? s.geöffnet[kId] : undefined;
      const nodes = (offene?.nodes ?? []) as Node[];
      const edges = (offene?.edges ?? []) as Edge[];

      if (!nodeId) return { dataRefs: [] as unknown[] };

      const incoming = edges.filter(e => e.target === nodeId);
      if (incoming.length === 0) return { dataRefs: [] as unknown[] };

      const byId = new Map(nodes.map(n => [n.id, n] as const));
      const sources = incoming
        .map(e => byId.get(e.source))
        .filter((n): n is Node => !!n);

      return { dataRefs: sources.map(n => n.data as unknown) };
    })
  );

  return dataRefs as Daten[];
}

export function shallowArrayRefEqual(a: unknown[], b: unknown[]) {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}