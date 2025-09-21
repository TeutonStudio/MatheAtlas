// ./src/Atlas/KontextMenü/PaneKontext.tsx


import React, { useEffect, useRef, useState } from "react";
import { type XYPosition, type EdgeChange, Position, useReactFlow } from "@xyflow/react";
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { type Lebensraum } from "@/Atlas/Karten.types.ts";
import { useKartenStore } from "@/Ordnung/DatenBank/KartenStore";
import { Item } from "@/Atlas/KontextMenü/methoden.tsx";
import InstanzierbareKnotenDialogContent from '@/Atlas/Karten/InstanzierbareKnotenDialog';
import ListenDialog from "@/Ordnung/Dialoge/ListenDialog";
import { ListenAktion } from "@/Ordnung/Dialoge.types";



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
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) onClose?.();
        }}
      ><NeuerKnoten open={open} setOpen={setOpen} scope={scope} position={position} screenToFlowPosition={screenToFlowPosition} /></Dialog>

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
  const { db, aktiveKarteId, hatZirkulaereAbhaengigkeit, addKartenKnoten, onNodesChange } = useKartenStore();
  
  const instanziierbareKarten = Object.values(db).filter(
    (karte) =>
      karte.id &&
      aktiveKarteId &&
      karte.id !== aktiveKarteId &&
      !hatZirkulaereAbhaengigkeit(aktiveKarteId, karte.id)
  );
  const aktion = instanziierbareKarten.map( karte => {
    return {
      name: karte.name,
      onSelect: (e: Event) => {
        // TODO KartenKnoten erzeugen auf aktueller Karte
      } 
    } as ListenAktion
  }
  )
  function onClick(e:React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  };
  function onClose() {
    setOpen(false);
  };
  function handlePick(id: string) {
    // position sind die client/screen coords aus dem Kontextmenü
    const flowPos = screenToFlowPosition(position);
    addKartenKnoten(id, flowPos);
    setOpen(false);
  };

  if (scope !== "defined") {
    return (
      <>
        <DialogTrigger asChild>
          <Item onClick={onClick} >
            Neuer Knoten
          </Item>
        </DialogTrigger>

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

