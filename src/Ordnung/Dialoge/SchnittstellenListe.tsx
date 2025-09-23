// ./src/Ordnung/SchnittstellenListe.tsx

import React from "react";
import { type Node, type NodeChange } from "@xyflow/react";
import { Trash2, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useKartenStore } from "../DatenBank/KartenStore";
import { KNOTEN } from "@/Atlas/Karten.types";
import { Fluß } from "@/Atlas/Anschlüsse.types";
import { SchnittstellenDaten } from "@/Atlas/Knoten.types";

interface SchnittstellenListeProps {
  aktiveKarteId: string;
  schnittstellenKnoten: Node[];
}

export function SchnittstellenListe({ aktiveKarteId, schnittstellenKnoten }: SchnittstellenListeProps) {
  const { removeSchnittstelle, onNodesChange } = useKartenStore();

  function handleRemoveSchnittstelle(schnittstelleId: string) {
    removeSchnittstelle(aktiveKarteId, schnittstelleId);
    const nodeId = `schnittstelle-${schnittstelleId}`;
    const changes: NodeChange[] = [{ type: "remove", id: nodeId }];
    onNodesChange(changes);
  }

  const eingänge = schnittstellenKnoten.filter(
    (knoten) => knoten.data.fluss === Fluß.Eingang
  );
  const ausgänge = schnittstellenKnoten.filter(
    (knoten) => knoten.data.fluss === Fluß.Ausgang
  );

  return (
    <div className="mt-6">
      <Collapsible defaultOpen>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between w-full mb-2">
            <h3 className="font-semibold">Eingänge ({eingänge.length})</h3>
            <Button variant="ghost" size="sm" className="w-9 p-0">
              <ChevronsUpDown className="h-4 w-4" />
              <span className="sr-only">Toggle</span>
            </Button>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="flex flex-col gap-2">
          {eingänge.map((knoten) => {
            const schnittstelleId = knoten.id.replace("schnittstelle-", "");
            const { label, dtype } = knoten.data as SchnittstellenDaten;
            return (
              <div
                key={knoten.id}
                className="flex items-center justify-between p-2 rounded-md border"
              >
                <div>
                  <p className="font-medium">{label}</p>
                  <p className="text-sm text-muted-foreground">{dtype}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveSchnittstelle(schnittstelleId)}
                  aria-label="Schnittstelle löschen"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </CollapsibleContent>
      </Collapsible>

      <Collapsible defaultOpen className="mt-4">
        <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between w-full mb-2">
                <h3 className="font-semibold">Ausgänge ({ausgänge.length})</h3>
                <Button variant="ghost" size="sm" className="w-9 p-0">
                <ChevronsUpDown className="h-4 w-4" />
                <span className="sr-only">Toggle</span>
                </Button>
            </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="flex flex-col gap-2">
          {ausgänge.map((knoten) => {
            const schnittstelleId = knoten.id.replace("schnittstelle-", "");
            const { label, dtype } = knoten.data as SchnittstellenDaten;
            return (
              <div
                key={knoten.id}
                className="flex items-center justify-between p-2 rounded-md border"
              >
                <div>
                  <p className="font-medium">{label}</p>
                  <p className="text-sm text-muted-foreground">{dtype}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveSchnittstelle(schnittstelleId)}
                  aria-label="Schnittstelle löschen"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
