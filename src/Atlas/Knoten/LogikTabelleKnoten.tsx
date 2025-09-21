// ./src/Atlas/Knoten/LogikTabelleKnoten.tsx

import * as React from "react";
import { Position } from "@xyflow/react";
import { useKartenStore } from "@/Ordnung/DatenBank/KartenStore";
import BasisKnoten from "@/Atlas/Knoten/BasisKnoten";
import KnotenDebug, { Anschluss, MathRenderer } from "@/Atlas/Knoten/methoden";
import {
  type LogikTabelleDaten,
  type LogikTabelleArgumente,
  BasisKnotenArgumente
} from "@/Atlas/Knoten.types";
import {
  type AnschlussNachSeite,
  Fluß,
  DatenTypen,
  Variante
} from "@/Atlas/Anschlüsse.types";
import { Switch } from "@/components/ui/switch";
import { lüge, wahr } from "@/Daten/Formeln/logik";

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
      .slice(0, 4);
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
  const basis = { title: data.title ?? "Konjunktion", badge: data.badge ?? `Logik`, anschlüsse };
  const basisArgument = {
    id, selected, style,
    data: basis,
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

/** Dev-Helper für den Canvas */
export function TestLogikTabelleKnoten({ id }: { id: string }) {
  const anschlüsse: AnschlussNachSeite = {
    [Position.Bottom]: [
      Anschluss("A", DatenTypen.Logik, Fluß.Eingang, Variante.Einzel),
      Anschluss("B", DatenTypen.Logik, Fluß.Eingang, Variante.Einzel),
    ],
    [Position.Top]: [
      Anschluss("Out", DatenTypen.Logik, Fluß.Ausgang, Variante.Einzel),
    ],
  };

  const data: LogikTabelleDaten = {
    title: "Logik",
    badge: "UND",
    ergebnisse: [false, false, false, true],
    anschlüsse,
  };

  const argument = {
    id,
    data,
    selected: false,
    dragging: false,
    zIndex: 0,
    isConnectable: true,
    type: "logik-tabelle",
    draggable: true,
    deletable: true,
  } as LogikTabelleArgumente;

  return <LogikTabelleKnoten {...argument} />;
}
