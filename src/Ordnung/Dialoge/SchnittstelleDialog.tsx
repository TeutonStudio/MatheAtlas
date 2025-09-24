/// ./src/Ordnung/Atlas/Dialoge/SchnittstelleDialog.tsx

import * as React from "react";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { Definiere } from "./Definiere";
import { useKartenStore } from "@/Ordnung/DatenBank/KartenStore";
import { Fluß, DatenTypen } from "@/Atlas/Anschlüsse.types";
import { KNOTEN, type Schnittstelle } from "@/Atlas/Karten.types";
import type { OffeneKarte } from "@/Ordnung/datenbank.types";
import type { Node, NodeChange } from "@xyflow/react";

const flussOptionen: [string, Fluß][] = [
  ["Eingang", Fluß.Eingang],
  ["Ausgang", Fluß.Ausgang],
];

const datenOptionen: [string, DatenTypen][] = [
  ["Unbekannt", DatenTypen.Unbekannt],
  ["Logik", DatenTypen.Logik],
  ["Menge", DatenTypen.Menge],
  ["Zahl", DatenTypen.Zahl],
];

export function SchnittstelleDialog({
  aktiveKarteId,
  offeneKarte,
  children,
}: {
  aktiveKarteId: string | null;
  offeneKarte: OffeneKarte | undefined;
  children?: React.ReactNode;
}) {
  const { addSchnittstelle, onNodesChange } = useKartenStore();

  function nextYOffset(fluss?: Fluß) {
    if (!offeneKarte || !fluss) return 80;
    const count = offeneKarte.nodes.filter(
      n => n.type === KNOTEN.Schnittstelle && n.data?.fluss === fluss
    ).length;
    return count * 80 + 80;
  }

  return (
    <Definiere
      trigger={children ?? <Button> Schnittstelle definieren </Button>}
      title="Schnittstelle hinzufügen"
      description="Definiere eine neue Schnittstelle für deine Karte."
      initial={{ name: "", fluss: Fluß.Ausgang as Fluß, datentyp: DatenTypen.Unbekannt as DatenTypen }}
      fields={[
        { kind: "text", key: "name", label: "Name", placeholder: "z. B. Benutzereingabe" },
        { kind: "select", key: "fluss", label: "Fluß", placeholder: "Richtung auswählen", options: flussOptionen },
        { kind: "select", key: "datentyp", label: "Daten Struktur", placeholder: "auswählen", options: datenOptionen },
      ]}
      validate={(s) => {
        if (!aktiveKarteId) return "Keine aktive Karte.";
        if (!s.name || s.name.trim() === "") return "Name darf nicht leer sein.";
        if (!s.fluss) return "Bitte Fluß wählen.";
        if (!s.datentyp) return "Bitte Datentyp wählen.";
        // Eindeutigkeit prüfen auf DB-Ebene: hier nur UX-Precheck, Store validiert ebenfalls
        return null;
      }}
      onSubmit={(s, close, reset) => {
        if (!aktiveKarteId) return;
        const schnittstelle: Schnittstelle = {
          id: nanoid(),
          name: s.name.trim(),
          fluss: s.fluss,
          datentyp: s.datentyp,
        };

        const xPos = s.fluss === Fluß.Eingang ? -200 : 700;
        const neuerKnoten: Node = {
          id: `schnittstelle-${schnittstelle.id}`,
          type: KNOTEN.Schnittstelle,
          position: { x: xPos, y: nextYOffset(s.fluss) },
          data: { title: schnittstelle.name, fluss: s.fluss, dtype: s.datentyp },
          deletable: true,
        };

        addSchnittstelle(aktiveKarteId, schnittstelle);
        const changes: NodeChange[] = [{ type: "add", item: neuerKnoten }];
        onNodesChange(changes);

        reset();
        close();
      }}
    />
  );
}
