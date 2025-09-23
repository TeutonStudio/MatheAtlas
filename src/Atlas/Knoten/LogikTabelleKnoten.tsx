// ./src/Atlas/Knoten/LogikTabelleKnoten.tsx

import * as React from "react";
import { Position } from "@xyflow/react";

import { Switch } from "@/components/ui/switch";

import { useKartenStore } from "@/Ordnung/DatenBank/KartenStore";
import BasisKnoten from "@Knoten/BasisKnoten";
import KnotenDebug, { MathRenderer } from "@/Atlas/Knoten/methoden";
import { BasisKnotenArgumente, type LogikTabelleArgumente } from "@Knoten.types";
import { Fluß, DatenTypen } from "@Anschlüsse.types";
import { lüge, wahr } from "@/Daten/Formeln/logik";

export const maxFälle = 9;

/** Alle möglichen Permutationen für n Eingänge */
const erzeugePermutationen = (n: number): boolean[][] => {
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

export default function LogikTabelleKnoten(argumente: LogikTabelleArgumente) {
  const { id, data, selected, draggable, deletable } = argumente;
  const isReadOnly = draggable === false && deletable === false;
  const anschlüsse = data.anschlüsse;

  const { eingänge, permutationen } = React.useMemo(() => {
    const alleSeiten = [Position.Left, Position.Right, Position.Top, Position.Bottom];
    const alle = alleSeiten.flatMap(pos => anschlüsse?.[pos] ?? []);
    const valideEingänge = alle
      .filter(a => a.fluss === Fluß.Eingang && a.dtype === DatenTypen.Logik)
      .slice(0, maxFälle);
    return {
      eingänge: valideEingänge,
      permutationen: erzeugePermutationen(valideEingänge.length),
    };
  }, [anschlüsse]);

  const n = eingänge.length;
  const anzahlZeilen = permutationen.length;

  const updateNodeData = useKartenStore(s => s.updateNodeData);

  const ergebnisse = React.useMemo(() => {
    const aktuelleErgebnisse = data.ergebnisse ?? [];
    if (aktuelleErgebnisse.length !== anzahlZeilen) {
      return Array(anzahlZeilen).fill(false);
    }
    return aktuelleErgebnisse;
  }, [data.ergebnisse, anzahlZeilen]);

  React.useEffect(() => {
    if (!isReadOnly && (data.ergebnisse?.length ?? 0) !== anzahlZeilen) {
      updateNodeData(id, prev => ({ ...prev, ergebnisse: Array(anzahlZeilen).fill(false) }));
    }
  }, [anzahlZeilen, data.ergebnisse, id, updateNodeData, isReadOnly]);

  const handleSwitchChange = (index: number, neuerWert: boolean) => {
    if (isReadOnly) return;
    const neueErgebnisse = [...ergebnisse];
    neueErgebnisse[index] = neuerWert;
    updateNodeData(id, prev => ({ ...prev, ergebnisse: neueErgebnisse }));
  };
  
  const style = { minWidth: 280 } as React.CSSProperties;
  const title = data.title ?? "Logik Tabelle";
  const badge = data.badge ?? `Logik`;
  const basisArgument = {
    id, selected, style,
    data: { title, badge, anschlüsse},
    isConnectable: argumente.isConnectable,
    type: "logik-tabelle",
  } as BasisKnotenArgumente;
  
  if (KnotenDebug) {
    console.log("selektiert LogikTabelleKnoten",selected,id)
    // Debug
  }
  return (
    <BasisKnoten {...basisArgument}>
      {n === 0 ? (
        <div className="p-2 text-xs text-gray-500">Füge Logik-Eingänge hinzu.</div>
      ) : (
        <div className="overflow-x-auto p-1">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                {eingänge.map((eingang) => (
                  <th key={eingang.id} scope="col" className="px-3 py-2 text-center">{" "}</th>
                ))}
                <th scope="col" className="px-3 py-2 text-center border-l dark:border-gray-600">Ergebniss</th>
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
                  <td className="px-3 py-2 text-center border-l dark:border-gray-600">
                    {isReadOnly ? (
                      <MathRenderer latex={ergebnisse[zeilenIndex] ? wahr() : lüge()} />
                    ) : (
                      <Switch
                        checked={!!ergebnisse[zeilenIndex]}
                        onCheckedChange={(val) => handleSwitchChange(zeilenIndex, val)}
                        className="mx-auto"
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </BasisKnoten>
  );
}
