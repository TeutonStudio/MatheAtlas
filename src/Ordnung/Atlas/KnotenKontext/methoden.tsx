/// ./src/Ordnung/Atlas/KnotenKontext/methoden.tsx

import { Position, type Edge } from "@xyflow/react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

import { KontextAtlasArgumente } from "@/Ordnung/Atlas.types";
import { Schnittstelle } from "@/Atlas/Karten.types";
import { DatenTypen, Fluß, Variante, type AnschlussNachSeite, type AnschlussDefinition } from "@/Atlas/Anschlüsse.types";

import { maxFälle } from "@/Atlas/Knoten/LogikKnoten";
import { LOGIK_VARIANTEN, type LogikVariante } from "./LogikKontext";
import { SEPARATOR } from "@/Atlas/Anschlüsse/methoden";

export default function KontextAtlas(argumente: KontextAtlasArgumente) {
  const { überschrift, beschreibung, children } = argumente;

  function Beschreibung() {
    if (!beschreibung) return null;

    // wenn beschreibung ein string ist: normalisieren + Newlines respektieren
    if (typeof beschreibung === "string") {
      return (
        <CardDescription className="whitespace-pre-line">
          {normalizeNewlines(beschreibung)}
        </CardDescription>
      );
    }

    // wenn bereits ein ReactNode, einfach ausgeben
    return <CardDescription>{beschreibung}</CardDescription>;
  }

  function Inhalt() {
    if (!children) return null;
    return <CardContent className="space-y-3">{children}</CardContent>;
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{überschrift}</CardTitle>
        <Beschreibung />
      </CardHeader>
      <Inhalt />
    </Card>
  );
}


export function buildLogikAnschluesse(inputCount: number): AnschlussNachSeite {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const count = Math.max(0, Math.min(maxFälle, inputCount | 0));

  const left = Array.from({ length: count }, (_, i) => {
    let label: string;

    if (alphabet.length >= count) {
      // Einfach Buchstaben bis maxFälle
      label = alphabet[i];
    } else {
      label = `A${i + 1}`;
    }

    return {
      id: label,
      name: label,
      dtype: DatenTypen.Logik,
      fluss: Fluß.Eingang,
      variante: Variante.Einzel,
    };
  });

  const top = [
    {
      id: "Out",
      name: "Out",
      dtype: DatenTypen.Logik,
      fluss: Fluß.Ausgang,
      variante: Variante.Einzel,
    },
  ];

  return {
    [Position.Bottom]: left,
    [Position.Top]: top,
  };
}

// erzeugt 2^n Zeilen
export function erzeugePermutationen(n: number): boolean[][] {
  if (n <= 0) return [[]];
  const perms: boolean[][] = [];
  const rows = 1 << n;
  for (let i = 0; i < rows; i++) {
    const zeile: boolean[] = [];
    for (let j = n - 1; j >= 0; j--) {
      zeile.push(((i >> j) & 1) === 0);
    }
    perms.push(zeile);
  }
  return perms;
}

// kleine Helferfunktion: macht aus "\n" echte Newlines und normiert \r\n
function normalizeNewlines(s: string) {
  return s.replace(/\r\n/g, "\n").replace(/\\n/g, "\n");
}


const EINGANG_ID = "eingang";
const AUSGANG_ID = "ausgang";

function defEinzel(id: string, fluss: Fluß, dtype = DatenTypen.Logik): AnschlussDefinition {
  return { id, dtype, fluss, variante: Variante.Einzel };
}
function defMulti(id: string, fluss: Fluß): AnschlussDefinition {
  return { id, dtype: DatenTypen.Logik, fluss, variante: Variante.Multi };
}

function hatVerbindungZuBasisId(edges: Edge[], nodeId: string, basisId: string, fluss: Fluß, erwarteteAnzahl: number): boolean {
  const istTarget = fluss === Fluß.Eingang;
  const hits = edges.filter(e =>
    istTarget
      ? e.target === nodeId && (e.targetHandle?.startsWith(basisId + SEPARATOR) || e.targetHandle === basisId)
      : e.source === nodeId && (e.sourceHandle?.startsWith(basisId + SEPARATOR) || e.sourceHandle === basisId)
  ).length;
  return hits >= erwarteteAnzahl;
}

export function buildLogikAnschluesseVariante(
  variante: LogikVariante,
  nodeId: string,
  edges: Edge[],
  eingabeAnzahl?: number // nur für Tabelle
): AnschlussNachSeite {
  const top: AnschlussDefinition[] = [];
  const bottom: AnschlussDefinition[] = [];

  switch (variante) {
    case "Tabelle": {
      const n = Math.max(0, Math.min((eingabeAnzahl ?? 0) | 0, 9));
      for (let i = 0; i < n; i++) bottom.push(defEinzel(`${EINGANG_ID}${i + 1}`, Fluß.Eingang));
      top.push(defEinzel(AUSGANG_ID, Fluß.Ausgang)); // ein Ergebnis-Ausgang
      break;
    }
    case "nicht": {
      bottom.push(defEinzel(EINGANG_ID, Fluß.Eingang));
      const inputsOk = hatVerbindungZuBasisId(edges, nodeId, EINGANG_ID, Fluß.Eingang, 1);
      if (inputsOk) top.push(defEinzel(AUSGANG_ID, Fluß.Ausgang));
      break;
    }
    case "und": {
      bottom.push(defMulti(EINGANG_ID, Fluß.Eingang));  // dynamischer Multi-Eingang
      top.push(defEinzel(AUSGANG_ID, Fluß.Ausgang));    // Ausgang ist immer sichtbar
      break;
    }
    case "oder": {
      bottom.push(defMulti(EINGANG_ID, Fluß.Eingang));  // dynamischer Multi-Eingang
      top.push(defEinzel(AUSGANG_ID, Fluß.Ausgang));    // Ausgang ist immer sichtbar
      break;
    }
    case "dann": { // Implikation
      bottom.push(defEinzel(`${EINGANG_ID}1`, Fluß.Eingang));
      bottom.push(defEinzel(`${EINGANG_ID}2`, Fluß.Eingang));
      const ok =
        hatVerbindungZuBasisId(edges, nodeId, `${EINGANG_ID}1`, Fluß.Eingang, 1) &&
        hatVerbindungZuBasisId(edges, nodeId, `${EINGANG_ID}2`, Fluß.Eingang, 1);
      if (ok) top.push(defEinzel(AUSGANG_ID, Fluß.Ausgang));
      break;
    }
    default: {
      // Fallback wie Dummy: 0 Eingänge, Hinweis etc.
    }
  }

  return { [Position.Bottom]: bottom, [Position.Top]: top } as AnschlussNachSeite;
}

const IN_BASE = "in__base";
const IN_SCHNITT = (id: string) => `in__schnittstelle__${id}`;
const IN_ARG = (name: string) => `in__arg__${name}`; // wenn eingangsTyp=Term
const OUT_TERM = "out__term";


function seiteFuerEingang(dtype: DatenTypen): Position {
  return dtype === DatenTypen.Logik ? Position.Bottom : Position.Left;
}
function seiteFuerAusgang(dtype: DatenTypen): Position {
  return dtype === DatenTypen.Logik ? Position.Top : Position.Right;
}

export type AuswertungPortsInput = {
  eingangsTyp: DatenTypen;
  hatVariablen: boolean;
  schnittstellen: Schnittstelle[];
  argVariablenNamen: string[]; // nur verwendet, wenn eingangsTyp = Term
};

export function buildAuswertungAnschlüsse(input: AuswertungPortsInput): AnschlussNachSeite {
  const bottom: AnschlussDefinition[] = [];
  const left: AnschlussDefinition[] = [];
  const right: AnschlussDefinition[] = [];
  const top: AnschlussDefinition[] = [];

  // Basis-Eingang (außer wenn explizit Term: dann kommen nur Arg-Eingänge)
  if (input.eingangsTyp !== DatenTypen.Term) {
    const s = seiteFuerEingang(input.eingangsTyp);
    const base = defEinzel(IN_BASE, Fluß.Eingang, input.eingangsTyp);
    if (s === Position.Bottom) bottom.push(base);
    else left.push(base);
  } else {
    // Term: Argumente als eigene Eingänge
    const s = seiteFuerEingang(DatenTypen.Term); // Term ist mathem. Objekt → links
    const defs = input.argVariablenNamen.map(n => defEinzel(IN_ARG(n), Fluß.Eingang, DatenTypen.Term));
    if (s === Position.Bottom) bottom.push(...defs);
    else left.push(...defs);
  }

  // Schnittstellen-Eingänge (einmalig, sortiert)
  for (const sDef of input.schnittstellen) {
    const s = seiteFuerEingang(sDef.datentyp);
    const d = defEinzel(IN_SCHNITT(sDef.id), Fluß.Eingang, sDef.datentyp);
    if (s === Position.Bottom) bottom.push(d);
    else left.push(d);
  }

  // Ausgang nur, wenn Variablen im Upstream
  if (input.hatVariablen) {
    const s = seiteFuerAusgang(DatenTypen.Term); // Term-Ausgang ist rechts
    const out = defEinzel(OUT_TERM, Fluß.Ausgang, DatenTypen.Term);
    if (s === Position.Top) top.push(out);
    else right.push(out);
  }

  const out: AnschlussNachSeite = {};
  if (bottom.length) out[Position.Bottom] = bottom;
  if (left.length) out[Position.Left] = left;
  if (right.length) out[Position.Right] = right;
  if (top.length) out[Position.Top] = top;
  return out;
}
