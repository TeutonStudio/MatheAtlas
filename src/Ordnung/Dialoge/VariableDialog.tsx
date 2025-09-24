/// ./src/Ordnung/dialoge/VariableDialog.tsx

/// ./src/Ordnung/Atlas/Dialoge/VariableDialog.tsx
import * as React from "react";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { Definiere } from "./Definiere";
import { useKartenStore } from "@/Ordnung/DatenBank/KartenStore";
import { DatenTypen, Fluß } from "@/Atlas/Anschlüsse.types";
import { KNOTEN, type Variable } from "@/Atlas/Karten.types";
import type { OffeneKarte } from "@/Ordnung/datenbank.types";
import type { Node, NodeChange } from "@xyflow/react";

const datenOptionen: [string, DatenTypen][] = [
  ["Unbekannt", DatenTypen.Unbekannt],
  ["Logik", DatenTypen.Logik],
  ["Menge", DatenTypen.Menge],
  ["Zahl", DatenTypen.Zahl],
];

export function VariableDialog({
  aktiveKarteId,
  offeneKarte,
  children,
}: {
  aktiveKarteId: string | null;
  offeneKarte: OffeneKarte | undefined;
  children?: React.ReactNode;
}) {
  const { addVariable, onNodesChange } = useKartenStore();

  function nextYOffset() {
    if (!offeneKarte) return 80;
    const count = offeneKarte.nodes.filter(n => n.type === KNOTEN.Variable).length;
    return count * 80 + 80;
  }

  return (
    <Definiere
      trigger={children ?? <Button> Variable definieren </Button>}
      title="Variable hinzufügen"
      description="Definiere eine neue Variable (immer Eingang)."
      initial={{ name: "", datentyp: DatenTypen.Unbekannt as DatenTypen }}
      fields={[
        { kind: "text", key: "name", label: "Name", placeholder: "z. B. x" },
        { kind: "select", key: "datentyp", label: "Daten Struktur", placeholder: "auswählen", options: datenOptionen },
      ]}
      validate={(s) => {
        if (!aktiveKarteId) return "Keine aktive Karte.";
        if (!s.name || s.name.trim() === "") return "Name darf nicht leer sein.";
        if (!s.datentyp) return "Bitte Datentyp wählen.";
        return null;
      }}
      onSubmit={(s, close, reset) => {
        if (!aktiveKarteId) return;
        const variable: Variable = {
          id: nanoid(),
          name: s.name.trim(),
          datentyp: s.datentyp,
        };

        // Variablen sind Eingänge. Wir geben ihnen dieselbe Seitenlogik.
        const neuerKnoten: Node = {
          id: `variable-${variable.id}`,
          type: KNOTEN.Variable,
          position: { x: -200, y: nextYOffset() },
          data: { title: variable.name, dtype: variable.datentyp, fluss: Fluß.Eingang },
          deletable: true,
        };

        addVariable(aktiveKarteId, variable);
        const changes: NodeChange[] = [{ type: "add", item: neuerKnoten }];
        onNodesChange(changes);

        reset();
        close();
      }}
    />
  );
}
