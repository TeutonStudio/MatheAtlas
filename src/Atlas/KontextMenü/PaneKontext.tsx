// ./src/Atlas/KontextMenü/PaneKontext.tsx


import React, { useEffect, useRef, useState } from "react";
import { type XYPosition, type EdgeChange, Position, useReactFlow } from "@xyflow/react";
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { KartenDefinition, KNOTEN, type Lebensraum } from "@/Atlas/Karten.types.ts";
import { useKartenStore } from "@/Ordnung/DatenBank/KartenStore";
import { Item } from "@/Atlas/KontextMenü/methoden.tsx";
import ListenDialog from "@/Ordnung/Dialoge/ListenDialog";
import { ListenAktion } from "@/Ordnung/dialoge.types";
import { ElementKnotenDaten, LogikTabelleDaten } from "../Knoten.types";



export default function PaneItems( argument: { 
  id: string,
  onClose?: () => void, 
  // karte: KartenSammlung, 
  position: XYPosition,
} ) {
  const { id, onClose, position } = argument
  
  const [open, setOpen] = useState(false);
  //const aktiveKarteId = useKartenStore(s => s.aktiveKarteId);
  const findKarte = useKartenStore(s => s.findKarte);
  const geöffnet = useKartenStore(s => s.geöffnet);
  const dirty = geöffnet[id].dirty
  const karte = findKarte(id);
  //if (id!==aktiveKarteId) { console.log("ID Fehler: ",id,aktiveKarteId)}
  if (!karte) { return }

  const logKartenDefinition = () => {
    if (id) {
      const kartenDefinition = findKarte(id);
      const geöffneteKarte = geöffnet[id];
      console.log("--- Aktive Karte Definition ---");
      console.log("DB Definition:", kartenDefinition);
      console.log("Geöffnete Karte (Live-Zustand):", geöffneteKarte);
      console.log("---------------------------------");
      onClose?.();
    }
  };

  switch (karte.scope) {
    case "defined": {
      return (
        <div className="min-w-44">
          <Item onSelect={onClose} > Karte schließen </Item>
        </div>
      )
    }
    case "public": {
      console.log("Öffentliche Karte")
      return (<></>)
    }
    case "private": {
      return (
        <div className="min-w-44">
          <NeuerKnoten open={open} setOpen={setOpen} onClose={onClose} scope={karte.scope} position={position} />
          <Speichern dirty={dirty} onSpeichern={() => {
            console.log("Speichert: ",karte.name)
            onClose?.()
          }} />
          <Item onSelect={onClose}>Einfügen TODO</Item>
          <Item onSelect={onClose}>Exportieren TODO</Item>
          <Item onSelect={logKartenDefinition}>Karten-Definition loggen</Item>
        </div>
      );
    }
    defualt: {
      console.log("Dummheit muss weh tun?!")
    }
  }
}


function Speichern({dirty,onSpeichern}:{
  dirty: boolean,
  onSpeichern: () => void, 
}) {
  if (dirty) {
    return (
      <Item onSelect={onSpeichern}>
        Speichern
      </Item>
    )
  }
}

function NeuerKnoten({open, setOpen, scope, position, onClose}:{
  open: boolean; 
  setOpen: (open: boolean) => void;
  scope: Lebensraum; 
  position: XYPosition;
  onClose?: () => void;
  
}) {
  const { db, aktiveKarteId, hatZirkulaereAbhaengigkeit, addKnoten, addKartenKnoten, onNodesChange } = useKartenStore();
  const { screenToFlowPosition } = useReactFlow();
  const instanziierbareKarten = Object.values(db).filter(
    (karte) =>
      karte.id &&
      aktiveKarteId &&
      karte.id !== aktiveKarteId &&
      !hatZirkulaereAbhaengigkeit(aktiveKarteId, karte.id)
  ); instanziierbareKarten.push({
    id: "LT",
    name: "LogikTabelle",
  } as KartenDefinition); instanziierbareKarten.push({
    id: "E",
    name: "ElementKnoten"
  } as KartenDefinition);

  function onClick(e:React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
    console.log("neuer Knoten wird ausgewählt")
  };
  function handlePick(id: string) {
    const flowPos = screenToFlowPosition(position);
    if (id==="LT") {
      console.log("LogikKnoten hinzufügen")
      const data = {ergebnisse: [false,false,false,false]} as LogikTabelleDaten
      addKnoten(KNOTEN.LogikTabelle,flowPos,data)
    } else if (id==="E") {
      console.log("Elementnoten hinzufügen")
      const data = { menge: "\\emptyset", objekt: "\\mathcal{X}"} as ElementKnotenDaten
      addKnoten(KNOTEN.Element,flowPos,data)
    } else {
      console.log("Karte hinzufügen")
      addKartenKnoten(id, flowPos);
      setOpen(false);
      onClose?.()
    }
  };

  if (scope !== "defined") {
    return (
      <>
        <Item onClick={onClick}>Neuer Knoten</Item>

        {open && (
          <ListenDialog 
            open={open}
            title="Instanzierbare Knoten"
            onClose={() => setOpen(false)}
            items={instanziierbareKarten}
            mode="pick"
            onPick={handlePick}
          />
          )}
      </>
    )
  }
}

