import React, { useState, useMemo } from "react";
import { nanoid } from "nanoid";
import { type Node, type NodeChange, type ReactFlowJsonObject } from "@xyflow/react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useKartenStore } from "../DatenBank/KartenStore";
import { KNOTEN, type Schnittstelle } from "@/Atlas/Karten.types.ts";
import { Fluß, DatenTypen } from "@/Atlas/Anschlüsse.types.ts";
import { OffeneKarte } from "../datenbank.types";

export function SchnittstelleDialog({
  aktiveKarteId,
  offeneKarte,
  children,
}: {
  aktiveKarteId: string | null;
  offeneKarte: OffeneKarte | undefined;
  children: React.ReactNode;
}) {
  const { onNodesChange, addSchnittstelle } = useKartenStore();
  const [name, setName] = useState<string>();
  const [fluss, setFluss] = useState<Fluß>();
  const [dtype, setDatentyp] = useState<DatenTypen>();
  const [open, setOpen] = useState(false);

  const nextYOffset = useMemo(() => {
    if (!offeneKarte) return 80;
    const count = offeneKarte.nodes.filter(
      (n) => n.type === KNOTEN.Schnittstelle && n.data?.fluss === fluss
    ).length;
    return count * 80 + 80;
  }, [offeneKarte, fluss]);

  const xPos = fluss === Fluß.Eingang ? -200 : 700;

  function handleAddSchnittstelle() {
    if (!aktiveKarteId) return;
    if (!name || !fluss || !dtype) return;

    const neueSchnittstelle = { 
      id: nanoid(), name, fluss, datentyp:dtype
    } as Schnittstelle;

    const neuerKnoten: Node = {
      id: `schnittstelle-${neueSchnittstelle.id}`,
      type: KNOTEN.Schnittstelle,
      position: { x: xPos, y: nextYOffset },
      data: { title: name, fluss, dtype },
      deletable: false,
    };

    addSchnittstelle(aktiveKarteId, neueSchnittstelle);
    const changes: NodeChange[] = [{ type: "add", item: neuerKnoten }];
    onNodesChange(changes);

    setName("");
    setOpen(false);
  }

  const flussOptionen: [string, Fluß][] = [
    ["Eingang", Fluß.Eingang],
    ["Ausgang", Fluß.Ausgang],
  ];

  const FlußAuswahl = {
    label: "Fluß",
    wert: fluss,
    platzhalter: "Richtung auswählen",
    setWert: setFluss,
    optionen: flussOptionen,
  };

  const datenOptionen: [string, DatenTypen][] = [
    ["Unbekannt", DatenTypen.Unbekannt],
    ["Logik", DatenTypen.Logik],
    ["Menge", DatenTypen.Menge],
    ["Zahl", DatenTypen.Zahl],
  ];

  const DatenAuswahl = {
    label: "Daten Struktur",
    wert: dtype,
    platzhalter: "auswählen",
    setWert: setDatentyp,
    optionen: datenOptionen,
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schnittstelle hinzufügen</DialogTitle>
          <DialogDescription>
            Definiere eine neue Schnittstelle für deine Karte.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="z.B. Benutzereingabe"
            />
          </div>
          <Auswahl {...FlußAuswahl} />
          <Auswahl {...DatenAuswahl} />
        </div>
        <DialogFooter>
          <Button onClick={handleAddSchnittstelle} disabled={!name}>
            Hinzufügen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type AuswahlOption = [string, any];

type AuswahlDefinition = {
  label: string;
  wert: any;
  platzhalter: string;
  setWert: (val: any) => void;
  optionen: AuswahlOption[];
};

function Auswahl(argument: AuswahlDefinition) {
  const { label, wert, platzhalter, setWert, optionen } = argument;

  const wertName = useMemo(() => optionen.find((opt) => opt[1] === wert)?.[0], [
    wert,
    optionen,
  ]);

  function handleValueChange(neuerWertName: string) {
    const neuesWertEnum = optionen.find(
      (opt) => opt[0] === neuerWertName
    )?.[1];
    setWert(neuesWertEnum);
  }

  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor={label} className="text-right">
        {label}
      </Label>
      <Select value={wertName} onValueChange={handleValueChange}>
        <SelectTrigger className="col-span-3">
          <SelectValue placeholder={platzhalter} />
        </SelectTrigger>
        <SelectContent>
          {optionen.map(([name]) => (
            <SelectItem key={name} value={name}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}