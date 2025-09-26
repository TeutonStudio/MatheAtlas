/// ./src/Atlas/Knoten/AuswertungsKnoten.tsx

import * as React from "react";
import { useStore as useRFStore } from "@xyflow/react";
import { type Node } from "@xyflow/react";
import LaTeXKnoten from "./LaTeXKnoten";
import { DatenTypen, Fluß } from "@/Atlas/Anschlüsse.types";
import { type AuswertungsKnotenArgumente, type AuswertungsKnotenDaten, type LaTeXKnotenArgumente } from "@/Atlas/Knoten.types";
import { useKartenStore } from "@/Ordnung/DatenBank/KartenStore";
import { KNOTEN, type Schnittstelle } from "@/Atlas/Karten.types";
import { getUpstreamNodes, upstreamContainsType, collectByType, uniqueBy, sortBy } from "@/Ordnung/Graph/utils";
import { buildAuswertungAnschlüsse } from "@/Ordnung/Atlas/KnotenKontext/methoden";
//import { buildAuswertungAnschluesse } from "@/Ordnung/Atlas/KnotenKontext/AuswertungAnschlüsse";

export default function AuswertungsKnoten(argumente: AuswertungsKnotenArgumente) {
    const { id } = argumente;
    const updateNodeData = useKartenStore(s => s.updateNodeData);
    const nodes = useRFStore(s => s.nodes);
    const edges = useRFStore(s => s.edges);

    const data = {
        ...{title: "Auswerten",eingangsTyp: DatenTypen.Zahl},
        ...(argumente.data ?? {}),
    } as AuswertungsKnotenDaten;

    // Upstream-Analyse
    const upstream = React.useMemo(() => getUpstreamNodes(nodes as Node[], edges, id), [nodes, edges, id]);
    const hatVariablen = React.useMemo(() => upstreamContainsType(upstream, KNOTEN.Variable), [upstream]);

    // Schnittstellen aus dem Pfad, dedupliziert per data.handleID oder id; sortiert nach data.title
    const upSchnitt = React.useMemo(() => {
        const schnittNodes = collectByType(upstream, KNOTEN.Schnittstelle);
        const mapped = schnittNodes.map(n => {
        const d = n.data as any;
        const sid: string = d?.handleID ?? n.id;
        const name: string = d?.title ?? d?.label ?? sid;
        const fluss = Fluß.Eingang;
        const datentyp: DatenTypen = d?.dtype ?? DatenTypen.Zahl;
        return { id: sid, name, fluss, datentyp } as Schnittstelle;
        });
        const uniq = uniqueBy(mapped, x => x.id);
        return sortBy(uniq, x => x.name ?? "");
    }, [upstream]);

    // Wenn der Eingang auf Term steht: Variablen selbst werden als "Argument-Eingänge" behandelt
    const argVariablenNamen = React.useMemo(() => {
        if (data.eingangsTyp !== DatenTypen.Term) return [];
        const varNodes = collectByType(upstream, KNOTEN.Variable);
        const names = varNodes.map(n => {
        const d = n.data as any;
        return String(d?.title ?? d?.label ?? d?.handleID ?? "x");
        });
        // nach data.title sortieren und deduplizieren
        const uniq = uniqueBy(names, n => n);
        return uniq.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    }, [upstream, data.eingangsTyp]);

    // Ports bauen
    const anschlüsse = React.useMemo(() => buildAuswertungAnschlüsse({
        eingangsTyp: data.eingangsTyp!,
        hatVariablen,
        schnittstellen: upSchnitt,
        argVariablenNamen,
        }),
        [data.eingangsTyp, hatVariablen, upSchnitt, argVariablenNamen]
    );

    // LaTeX-Placeholder bauen: "komplette" Formel bis CAS existiert
    const latex = React.useMemo(() => {
        // Hilfsnamen
        const sList = upSchnitt.map(s => s.name);
        const sTail = sList.length ? `\\,;\\,${sList.join(", ")}` : "";

        if (hatVariablen) {
        // Term-Ausgang
        const args = argVariablenNamen.length ? argVariablenNamen.join(", ") : "x";
        return `f\\!\\left(${args}${sTail}\\right)\\;=\\;\\text{Auswertung}`;
        }

        // keine Variablen: reine Auswertung des Eingangstyps
        const sym = data.eingangsTyp === DatenTypen.Zahl ? "x"
                : data.eingangsTyp === DatenTypen.Menge ? "A"
                : data.eingangsTyp === DatenTypen.Logik ? "p"
                : "t";
        return `${sym}${sTail}\\;=\\;\\text{Auswertung}`;
    }, [hatVariablen, argVariablenNamen, upSchnitt, data.eingangsTyp]);

    // Daten ins Node schreiben, aber nur wenn sich wirklich etwas geändert hat

    React.useEffect(() => {
        // Aktuellen Stand aus den Props nehmen (argumente.data ist "prev")
        const prev = argumente.data as AuswertungsKnotenDaten | undefined;

        // Lokal die nächste Version bauen
        const next: AuswertungsKnotenDaten = {
            ...(prev as any),
            title: "Auswerten",
            eingangsTyp: data.eingangsTyp,
            hatVariablen,
            schnittstellen: upSchnitt,
            anschlüsse,
            latex,
        };

        // Vor dem Store-Call vergleichen, um *jeden* nutzlosen set() zu vermeiden
        if (shallowEqualAuswertung(prev, next)) return;

        updateNodeData(id, old => {
            // Falls parallel etwas anderes kam: noch mal checken
            const cur = old as AuswertungsKnotenDaten | undefined;
            if (shallowEqualAuswertung(cur, next)) return old;
            return next;
        });
    }, [id, updateNodeData, argumente.data, data.eingangsTyp, hatVariablen, upSchnitt, anschlüsse, latex]);


    // an LaTeXKnoten übergeben
    const latexData = { title: "Auswerten", badge: "Auswertung", anschlüsse, latex } as any;
    const argument = { ...argumente, data: latexData } as LaTeXKnotenArgumente;
    return <LaTeXKnoten {...argument} />;
}

function shallowEqualAuswertung(a?: AuswertungsKnotenDaten, b?: AuswertungsKnotenDaten) {
  if (!a || !b) return false;
  if (a.eingangsTyp !== b.eingangsTyp) return false;
  if (a.hatVariablen !== b.hatVariablen) return false;
  if (a.latex !== b.latex) return false;
  // schnittstellen flach vergleichen
  const as = (a.schnittstellen ?? []).map((s:Schnittstelle) => `${s.id}|${s.name}|${s.datentyp}`).join(";");
  const bs = (b.schnittstellen ?? []).map((s:Schnittstelle) => `${s.id}|${s.name}|${s.datentyp}`).join(";");
  if (as !== bs) return false;
  // anschlüsse referenziell schwer, also grob via JSON
  const ja = JSON.stringify(a.anschlüsse ?? {});
  const jb = JSON.stringify(b.anschlüsse ?? {});
  return ja === jb;
}
