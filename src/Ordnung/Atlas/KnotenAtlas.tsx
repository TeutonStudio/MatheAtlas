// ./src/Ordnung/Atlas/KnotenAtlas.

import React, { useMemo } from "react";
import { type Node, type Edge, type Connection } from "@xyflow/react";


import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { KNOTEN, Lebensraum } from "@/Atlas/Karten.types.ts";

import { useKartenStore } from "../DatenBank/KartenStore.ts";
import { SchnittstelleDialog } from "../Dialoge/SchnittstelleDialog.tsx";
import { SchnittstellenListe } from "../SchnittstellenListe.tsx";
import { KontextAtlas } from "./methoden.tsx";

export default function KnotenAtlas() {
  const { aktiveKarteId, findKarte, geöffnet } = useKartenStore();
  const selection = useKartenStore(s => s.selection);
  const deleteSelected = useKartenStore(s => s.deleteSelected);
  const duplicateSelected = useKartenStore(s => s.duplicateSelected);
  const groupSelected = useKartenStore(s => s.groupSelected);
  const copySelectionToNewCard = useKartenStore(s => s.copySelectionToNewCard);
  const moveSelectionToNewCard = useKartenStore(s => s.moveSelectionToNewCard);

  const selectedCount = (selection?.nodeIds?.length ?? 0) + (selection?.edgeIds?.length ?? 0);
  /*const modus: 'none' | 'single' | 'multi' =
    selectedCount === 0 ? 'none' : selectedCount === 1 ? 'single' : 'multi';*/
    
  const aktiveKarte = aktiveKarteId ? findKarte(aktiveKarteId) : null;
  const offeneKarte = aktiveKarteId ? geöffnet[aktiveKarteId] : undefined;
  const scope = (aktiveKarte?.scope === offeneKarte?.scope && aktiveKarte) ? aktiveKarte.scope : undefined;


  // selektierten Node ermitteln
  const selectedNode = useMemo(() => {
    if (!offeneKarte || (selection?.nodeIds?.length ?? 0) !== 1) return null;
    const id = selection!.nodeIds[0];
    return offeneKarte.nodes.find(n => n.id === id) ?? null;
  }, [offeneKarte, selection]);

  const schnittstellenKnoten = useMemo(() => {
    if (!offeneKarte) return [];
    return offeneKarte.nodes.filter((n) => n.type === KNOTEN.Schnittstelle);
  }, [offeneKarte]);

  if (scope!=="defined") {
    switch (selectedCount === 0 ? 'none' : selectedCount === 1 ? 'single' : 'multi') {
      case "none": {
        // Wrapper-Komponente für den Button-Dialog
        const DialogWrapper: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
          <SchnittstelleDialog aktiveKarteId={aktiveKarteId} offeneKarte={offeneKarte!}>
            {children}
          </SchnittstelleDialog>
        );

        return (
          <>
            <KontextAtlas
              überschrift="Schnittstellen"
              beschreibung="Verwalte die Ein- und Ausgänge deiner Karte."
              interaktion={() => console.log("Interaktion durchgeführt")}
              interaktionsfeld="Schnittstelle definieren"
              interaktionsdialog={DialogWrapper}
              inhalt={
                <SchnittstellenListe
                  aktiveKarteId={aktiveKarteId!}
                  schnittstellenKnoten={schnittstellenKnoten}
                />
              }
            />
          </>
        );
      };
      case "single": {
        return <KnotenKontext node={selectedNode!} scope={scope!} />
      };
      case "multi": {

      };
      default: console.log("Alles verkackt du hast")
    }
  } else {
    console.log("Vordefinierte Karten sind unveränderlich")
  }
}

function KnotenKontext(argumente:{ node: Node; scope: Lebensraum }) {
  const data = argumente.node.data
  const title = (data.title as string) ?? "Kein Name"
  const readonly = false

  const updateNodeData = useKartenStore(s => s.updateNodeData);
  const setInputCount = (countRaw: number) => {
    if (readonly) return;
    const inputCount = Math.max(0, Math.min(4, Number(countRaw) | 0));
    const anschlüsse = buildLogikAnschluesse(inputCount);
    const permutations = erzeugePermutationen(inputCount);
    // Ergebnisse auf neue Länge anpassen
    const newLen = permutations.length;
    const old = Array.isArray(data.ergebnisse) ? data.ergebnisse : [];
    const ergebnisse = old.slice(0, newLen);
    while (ergebnisse.length < newLen) ergebnisse.push(false);

    updateNodeData(argumente.node.id, prev => ({
      ...prev,
      inputCount,
      anschlüsse,
      ergebnisse,
    }));
  };

  switch (argumente.node.type as KNOTEN) {
    case KNOTEN.Schnittstelle: return (
      <KontextAtlas
        überschrift={title}
        beschreibung="Platzhalter"
        interaktionsfeld="Interagieren"
        interaktion={() => console.log("Interaktion durchgeführt")}
      />
    );
    case KNOTEN.LogikTabelle: {
      const inputCount = Number.isFinite(data.inputCount) ? (data.inputCount as number) : 0;

      return (
        <KontextAtlas
          überschrift={title}
          beschreibung="Logische Wahrheitstabelle. Stell die Anzahl der Eingänge ein."
          inhalt={
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 items-center gap-2">
                <Label>Anzahl Eingänge</Label>
                <Input
                  type="number"
                  min={0}
                  max={4}
                  value={inputCount}
                  disabled={readonly}
                  onChange={e => setInputCount(Number(e.target.value))}
                />
              </div>

              <div className="text-sm text-muted-foreground">
                Eingänge sind A..D links, Ausgang ist „Out“ oben. Änderungen passen die
                Tabelle und Ergebniszeilen automatisch an.
              </div>
            </div>
          }
          interaktionsfeld="—"
          interaktion={() => {}}
        />
      );
    }
    case KNOTEN.KartenKnoten: return (
      <KontextAtlas
        überschrift={(data.title as string) ?? "Kein Name"}
        beschreibung="Platzhalter"
        interaktionsfeld="Interagieren"
        interaktion={() => console.log("Interaktion durchgeführt")}
      />
    );
    default: {
      console.log("Betrachtet Knoten: ",argumente.node)
      return (
        <KontextAtlas
          überschrift={"Plathalter"}
          beschreibung="Plathalter"
          interaktionsfeld="Interagieren"
          interaktion={() => console.log("Interaktion durchgeführt")}
        />
      );
    }
  }
}

/*
function Beschreibung({scope}:{scope:Lebensraum | undefined}) {
  const text = "Verwalte die Ein- und Ausgänge deiner Karte.";
  return (
    <CardDescription>
      {text}
    </CardDescription>
  )
}

function Inhalt({aktiveKarteId, offeneKarte, schnittstellenKnoten, scope}:{
  aktiveKarteId: string | null;
  offeneKarte: any | undefined;
  schnittstellenKnoten: any;
  scope: Lebensraum | undefined;
}) {
  function Definieren() {
    if (scope !== "defined") {
      return (
        <SchnittstelleDialog
          aktiveKarteId={aktiveKarteId}
          offeneKarte={offeneKarte}
        >
          <Button className="w-full">Schnittstelle definieren</Button>
        </SchnittstelleDialog>
      )
    }
  }

  if(aktiveKarteId && offeneKarte) {
    return (
      <CardContent>
        <Definieren />
        <SchnittstellenListe
          aktiveKarteId={aktiveKarteId!}
          schnittstellenKnoten={schnittstellenKnoten}
        />
      </CardContent>
    )
  } else { return (<></>) }
}
*/
// helpers.ts
import { Position } from "@xyflow/react";
import { type AnschlussNachSeite, Fluß, DatenTypen, Variante } from "@/Atlas/Anschlüsse.types";

// Erzeugt bis zu 4 Eingänge: A, B, C, D auf der linken Seite
export function buildLogikAnschluesse(inputCount: number): AnschlussNachSeite {
  const labels = ["A", "B", "C", "D"];
  const count = Math.max(0, Math.min(4, inputCount | 0));
  const left = Array.from({ length: count }, (_, i) => ({
    id: labels[i],
    name: labels[i],
    dtype: DatenTypen.Logik,
    fluss: Fluß.Eingang,
    variante: Variante.Einzel,
  }));

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
