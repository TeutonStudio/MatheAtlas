// ./src/Atlas/Knoten/LogikTabelleKnoten.tsx

import * as React from "react";
import { Position, useStore } from "@xyflow/react";

import { Switch } from "@/components/ui/switch";

import { useKartenStore } from "@/Ordnung/DatenBank/KartenStore";
import BasisKnoten from "@/Atlas/Knoten/BasisKnoten";
import KnotenDebug, { erzeugePermutationen, MathRenderer } from "@/Atlas/Knoten/methoden";
import { BasisKnotenArgumente, BasisKnotenDaten, LogikKnotenDaten, type LogikArgumente } from "@/Atlas/Knoten.types";
import { Fluß, DatenTypen } from "@/Atlas/Anschlüsse.types";
import { lüge, wahr } from "@/Daten/Formeln/logik";
import { buildLogikAnschluesseVariante } from "@/Ordnung/Atlas/KnotenKontext/methoden";
import { LogikVariante } from "@/Ordnung/Atlas/KnotenKontext/LogikKontext";

export const maxFälle = 9;
const ErgebnisseNachVariante: Record<LogikVariante,boolean[] | undefined> = {
  "nicht": [false,true],
  "dann": [true,false,true,true],
  "und": [true,false,false,false],
  "oder": [true,true,true,false],
  "Tabelle": undefined, "Auswählen": undefined,
}

export default function LogikKnoten(argumente: LogikArgumente) {
  //const { id, data, selected } = argumente;
  const variante = argumente.data.variante ?? "Tabelle";
  const isReadOnly = variante !== "Tabelle";
  const anschlüsse = argumente.data.anschlüsse ?? {};

  const edges = useStore(s => s.edges);
  const updateNodeData = useKartenStore(s => s.updateNodeData);

  // Ausgang nur darstellen, wenn Inputs belegt (gilt für nicht/dann)
  React.useEffect(() => {
    if (variante === "nicht" || variante === "dann") {
      const next = buildLogikAnschluesseVariante(variante as any, argumente.id, edges);
      const curTop = (anschlüsse[Position.Top] ?? []).map(d => d.id).join("|");
      const nextTop = (next[Position.Top] ?? []).map(d => d.id).join("|");
      const curBot = (anschlüsse[Position.Bottom] ?? []).map(d => d.id).join("|");
      const nextBot = (next[Position.Bottom] ?? []).map(d => d.id).join("|");
      if (curTop !== nextTop || curBot !== nextBot) {
        updateNodeData(argumente.id, prev => ({ ...prev, anschlüsse: next }));
      }
    }
  }, [variante, argumente.id, edges, updateNodeData]); // eslint-disable-line

  // 1) Eingänge, so wie bisher ermittelt (für Fallback)
  const valideEingänge = React.useMemo(() => {
    const alleSeiten = [Position.Left, Position.Right, Position.Top, Position.Bottom];
    const alle = alleSeiten.flatMap(pos => anschlüsse?.[pos] ?? []);
    return alle
      .filter(a => a.fluss === Fluß.Eingang && a.dtype === DatenTypen.Logik)
      .slice(0, maxFälle);
  }, [anschlüsse]);

  // 2) Vordefinierte Ergebnisse je Variante
  const fixedResults = React.useMemo(() => {
    // tolerant gegenüber "negation" vs "nicht"
    return getFixedResultsForVariant(variante, ErgebnisseNachVariante as Record<string, boolean[] | undefined>);
  }, [variante]);

  // 3) n und Permutationen: wenn vordefiniert, aus length ableiten; sonst aus Eingängen
  const n = React.useMemo(() => {
    if (fixedResults) {
      const rawN = Math.log2(fixedResults.length);
      // Wenn die Länge kein Potenz-von-2 ist, ignorieren wir fixedResults und fallen auf echte Eingänge zurück
      return Number.isInteger(rawN) ? (rawN | 0) : valideEingänge.length;
    }
    return valideEingänge.length;
  }, [fixedResults, valideEingänge.length]);

  const permutationen = React.useMemo(() => erzeugePermutationen(n), [n]);
  const anzahlZeilen = permutationen.length;

  // 4) Ergebnisse, die die Tabelle anzeigen soll
  const ergebnisseAnzeigen = React.useMemo(() => {
    // Bei Varianten ≠ Tabelle im Readonly-Betrieb die vordefinierten Tabellenwerte verwenden
    if (isReadOnly && fixedResults && fixedResults.length === anzahlZeilen) {
      return fixedResults;
    }
    // Sonst wie zuvor: aus Node-Daten, auf Länge clampen
    const aktuelle = argumente.data.ergebnisse ?? [];
    if (aktuelle.length !== anzahlZeilen) {
      return Array(anzahlZeilen).fill(false);
    }
    return aktuelle;
  }, [isReadOnly, fixedResults, anzahlZeilen, argumente.data.ergebnisse]);

  // 5) Nur im editierbaren Tabellenmodus Datenlänge nachziehen
  React.useEffect(() => {
    if (!isReadOnly && (argumente.data.ergebnisse?.length ?? 0) !== anzahlZeilen) {
      updateNodeData(argumente.id, prev => ({ ...prev, ergebnisse: Array(anzahlZeilen).fill(false) }));
    }
  }, [anzahlZeilen, argumente.data.ergebnisse, argumente.id, updateNodeData, isReadOnly]);

  const style = { minWidth: 280 } as React.CSSProperties;
  const title = argumente.data.title ?? "Logik Knoten";
  const badge = argumente.data.badge ?? `Logik`;
  const data = { ...argumente.data, title, badge, anschlüsse } as BasisKnotenDaten
  const basisArgument = {...argumente, style, data, type: "logik-tabelle" } as BasisKnotenArgumente;

  if (KnotenDebug) {
    console.log("selektiert LogikTabelleKnoten", argumente.selected, argumente.id, "n=", n, "rows=", anzahlZeilen, "fixed?", !!fixedResults);
  }

  return (
    <BasisKnoten {...basisArgument}>
      {n === 0 ? (
        <div className="p-2 text-xs text-gray-500">
          Füge Logik-Eingänge hinzu oder wähle eine Variante im Kontext.
        </div>
      ) : (
        <div className="overflow-x-auto p-1">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                {/* Header-Spalten nur nach n, nicht nach den realen Anschluss-Definitionen */}
                {Array.from({ length: n }).map((_, i) => (
                  <th key={i} scope="col" className="px-3 py-2 text-center">{" "}</th>
                ))}
                <th scope="col" className="px-3 py-2 text-center border-l dark:border-gray-600">Ergebnis</th>
              </tr>
            </thead>
            <tbody>
              {permutationen.map((zeile, zeilenIndex) => (
                <tr key={zeilenIndex} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  {zeile.map((wert, wertIndex) => (
                    <td key={wertIndex} className="px-3 py-2 text-center">
                      <MathRenderer latex={wert ? wahr() : lüge()} />
                    </td>
                  ))}
                  <Ergebniss
                    id={argumente.id}
                    isReadOnly={isReadOnly}
                    ergebnisse={ergebnisseAnzeigen}
                    zeilenIndex={zeilenIndex}
                  />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </BasisKnoten>
  );
}

function getFixedResultsForVariant(
  variante: string,
  mapping: Record<string, boolean[] | undefined>
): boolean[] | undefined { return mapping[variante] }

function Ergebniss({id,isReadOnly,ergebnisse,zeilenIndex}:{id:string,isReadOnly:boolean,ergebnisse:boolean[],zeilenIndex:number}) {
  const updateNodeData = useKartenStore(s => s.updateNodeData);
  const handleSwitchChange = (index: number, neuerWert: boolean) => {
    if (isReadOnly) return;
    const neueErgebnisse = [...ergebnisse];
    neueErgebnisse[index] = neuerWert;
    updateNodeData(id, prev => ({ ...prev, ergebnisse: neueErgebnisse }));
  };
  function Anzeige() {
    if (isReadOnly) {
      return <MathRenderer latex={ergebnisse[zeilenIndex] ? wahr() : lüge()} />
    } else {
      return <Switch
        checked={!!ergebnisse[zeilenIndex]}
        onCheckedChange={(val) => handleSwitchChange(zeilenIndex, val)}
        className="mx-auto"
      />
    }
  };
  const style = "px-3 py-2 text-center border-l dark:border-gray-600"

  return (
    <td className={style}><Anzeige /></td>
  )
}