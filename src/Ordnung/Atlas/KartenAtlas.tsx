/// ./src/Ordnung/Atlas/KartenAtlas.tsx

import { useMemo } from "react";
import KontextAtlas from "@/Ordnung/Atlas/KnotenKontext/methoden.tsx";
import { Liste, ListItem } from "@/Ordnung/Dialoge/Liste";
import { SchnittstelleDialog } from "@/Ordnung/Dialoge/SchnittstelleDialog";
import { VariableDialog } from "@/Ordnung/Dialoge/VariableDialog";
import { Button } from "@/components/ui/button";

import { OffeneKarte } from "@/Ordnung/datenbank.types";
import { KartenDefinition, Variable } from "@/Atlas/Karten.types";
import { KNOTEN } from "@/Atlas/Karten.types";
import { Fluß, DatenTypen } from "@/Atlas/Anschlüsse.types";
import { useKartenStore } from "@/Ordnung/DatenBank/KartenStore";
import type { NodeChange } from "@xyflow/react";

export default function KartenAtlas({
  karte,
}: {
  karte: { definition: KartenDefinition; offene: OffeneKarte };
}) {
  const { onNodesChange, removeSchnittstelle, removeVariable } = useKartenStore();
  const scope = karte.offene.scope

  const schnittstellenKnoten = useMemo(
    () => karte.offene.nodes.filter(n => n.type === KNOTEN.Schnittstelle),
    [karte.offene.nodes]
  );
  const variablenKnoten = useMemo(
    () => karte.offene.nodes.filter(n => n.type === KNOTEN.Variable),
    [karte.offene.nodes]
  );

  function removeNodeAndMaybeModel(nodeId: string) {
    const changes: NodeChange[] = [{ type: "remove", id: nodeId }];
    onNodesChange(changes);
  }

  // Schnittstellen-Gruppen
  const eingangItems = schnittstellenKnoten
    .filter(k => k.data?.fluss === Fluß.Eingang)
    .map(k => ({
      id: k.id,
      title: k.data?.title ?? "(ohne Namen)",
      dtype: (k.data?.dtype as DatenTypen) ?? DatenTypen.Unbekannt,
    } as ListItem));

  const ausgangItems = schnittstellenKnoten
    .filter(k => k.data?.fluss === Fluß.Ausgang)
    .map(k => ({
      id: k.id,
      title: k.data?.title ?? "(ohne Namen)",
      dtype: (k.data?.dtype as DatenTypen) ?? DatenTypen.Unbekannt,
    } as ListItem));

  // Variablen-Gruppe (eine Gruppe)
  const variablenItems = variablenKnoten.map(k => ({
    id: k.id,
    title: k.data?.title ?? "(ohne Namen)",
    dtype: (k.data?.dtype as DatenTypen) ?? DatenTypen.Unbekannt,
  } as ListItem));

  function NeueSchnittstelle() {
    if (scope!=="defined") {
      return (
        <div>
          <SchnittstelleDialog
            aktiveKarteId={karte.definition.id}
            offeneKarte={karte.offene}
          >
            <Button> Schnittstelle definieren </Button>
          </SchnittstelleDialog>
        </div>
      )
    }
  };
  function NeueVariable() {
    if (scope!=="defined") {
      return (
        <div>
          <VariableDialog
            aktiveKarteId={karte.definition.id}
            offeneKarte={karte.offene}
          >
            <Button> Variable definieren </Button>
          </VariableDialog>
        </div>
      )
    }
  }

  return (
    <KontextAtlas überschrift={karte.definition.name} beschreibung="TODO">
      <div className="flex flex-col gap-6">
        {/* 1) Schnittstellen-Liste */}
        <Liste
          title="Schnittstellen"
          emptyText="Keine Schnittstellen definiert."
          groups={[
            { label: "Eingänge", items: eingangItems, defaultOpen: true },
            { label: "Ausgänge", items: ausgangItems, defaultOpen: true },
          ]}
          onRemove={(listItemId) => {
            if (!listItemId.startsWith("schnittstelle-")) { removeNodeAndMaybeModel(listItemId); return; }
            const schnittstelleId = listItemId.replace("schnittstelle-", "");
            removeSchnittstelle(karte.definition.id, schnittstelleId);
            removeNodeAndMaybeModel(listItemId);
          }}
        />

        {/* Button direkt unter der Liste */}
        <NeueSchnittstelle />

        {/* 2) Variablen-Liste */}
        <Liste
          title="Variablen"
          emptyText="Keine Variablen definiert."
          groups={[{ label: "Alle Variablen", items: variablenItems, defaultOpen: true }]}
          onRemove={(listItemId) => {
            if (!listItemId.startsWith("variable-")) { removeNodeAndMaybeModel(listItemId); return; }
            const variableId = listItemId.replace("variable-", "");
            removeVariable(karte.definition.id, variableId);
            removeNodeAndMaybeModel(listItemId);
          }}
        />

        {/* Button direkt unter der Variablenliste */}
        <NeueVariable />
      </div>
    </KontextAtlas>
  );
}
