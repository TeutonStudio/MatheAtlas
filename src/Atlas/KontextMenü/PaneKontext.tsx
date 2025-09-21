// ./src/Atlas/KontextMenü/PaneKontext.tsx


import React, { useEffect, useRef, useState } from "react";
import { type XYPosition, type EdgeChange, Position, useReactFlow } from "@xyflow/react";
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { KartenDefinition, KNOTEN, type Lebensraum } from "@/Atlas/Karten.types.ts";
import { useKartenStore } from "@/Ordnung/DatenBank/KartenStore";
import { Item } from "@/Atlas/KontextMenü/methoden.tsx";
import ListenDialog from "@/Ordnung/Dialoge/ListenDialog";
import { ListenAktion } from "@/Ordnung/Dialoge.types";
import { LogikTabelleDaten } from "../Knoten.types";



export default function PaneItems( argument: { 
  onClose?: () => void, 
  scope: Lebensraum, 
  position: XYPosition,
  screenToFlowPosition: (p:XYPosition) => XYPosition,
} ) {
  const { onClose, scope, position, screenToFlowPosition } = argument
  const [open, setOpen] = useState(false);
  const aktiveKarteId = useKartenStore(s => s.aktiveKarteId);
  const findKarte = useKartenStore(s => s.findKarte);
  const geöffnet = useKartenStore(s => s.geöffnet);

  const logKartenDefinition = () => {
    if (aktiveKarteId) {
      const kartenDefinition = findKarte(aktiveKarteId);
      const geöffneteKarte = geöffnet[aktiveKarteId];
      console.log("--- Aktive Karte Definition ---");
      console.log("DB Definition:", kartenDefinition);
      console.log("Geöffnete Karte (Live-Zustand):", geöffneteKarte);
      console.log("---------------------------------");
      onClose?.();
    }
  };

  return (
    <div className="min-w-44">
{/*      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) onClose?.();
        }}
      ></Dialog> */}
      <NeuerKnoten open={open} setOpen={setOpen} scope={scope} position={position} screenToFlowPosition={screenToFlowPosition} />
      <Item onSelect={onClose}>Einfügen</Item>
      <Item onSelect={onClose}>Exportieren</Item>
      <Item onSelect={logKartenDefinition}>Karten-Definition loggen</Item>
    </div>
  );
}


function NeuerKnoten({open, setOpen, scope, position, screenToFlowPosition}:{
  open: boolean; 
  setOpen: (open: boolean) => void;
  scope: Lebensraum; 
  position: XYPosition;
  screenToFlowPosition: (p:XYPosition) => XYPosition,
}) {
  const { db, aktiveKarteId, hatZirkulaereAbhaengigkeit, addKnoten, addKartenKnoten, onNodesChange } = useKartenStore();
  
  const instanziierbareKarten = Object.values(db).filter(
    (karte) =>
      karte.id &&
      aktiveKarteId &&
      karte.id !== aktiveKarteId &&
      !hatZirkulaereAbhaengigkeit(aktiveKarteId, karte.id)
  ); instanziierbareKarten.push({
    id: "LT",
    name: "LogikTabelle",
  } as KartenDefinition)

  function onClick(e:React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
    console.log("neuer Knoten wird ausgewählt")
  };
  function onClose() {
    setOpen(false);
  };
  function handlePick(id: string) {
    const flowPos = screenToFlowPosition(position);
    if (id==="LT") {
      console.log("Knoten hinzufügen")
      const data = {ergebnisse: [false,false,false,false]} as LogikTabelleDaten
      addKnoten(KNOTEN.LogikTabelle,flowPos,data)
    } else {
      console.log("Karte hinzufügen")
      addKartenKnoten(id, flowPos);
      setOpen(false);
    }
  };

  if (scope !== "defined") {
    return (
      <>{/*
        <DialogTrigger asChild>
          <Item onClick={onClick} >
            Neuer Knoten
          </Item>
        </DialogTrigger> */}
        <Item onClick={onClick}>Neuer Knoten</Item>

        {open && (
          <ListenDialog 
            open={open}
            title="Instanzierbare Knoten"
            onClose={onClose}
            items={instanziierbareKarten}
            mode="pick"
            onPick={handlePick}
          />
          )}
      </>
    )
  }
}

