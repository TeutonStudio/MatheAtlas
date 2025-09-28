// ./src/Atlas/KontextMenü/PaneKontext.tsx


import React, { useState } from "react";
import { type XYPosition, useReactFlow } from "@xyflow/react";

import { KartenDefinition, KNOTEN, type Lebensraum } from "@/Atlas/Karten.types.ts";
import { useKartenStore } from "@/Ordnung/DatenBank/KartenStore";
import { Item } from "@/Atlas/KontextMenü/methoden.tsx";
import ListenDialog from "@/Ordnung/Dialoge/ListenDialog";

import { AuswertungsKnotenDaten, RechenKnotenDaten, type ElementKnotenDaten, type LogikKnotenDaten, type ParameterKnotenDaten } from "../Knoten.types";

type PaneItemKontext = { id: string,onClose?: () => void, position: XYPosition }

export default function PaneItems( argument: PaneItemKontext ) {
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

function NeuerKnoten(argumente:{
  open: boolean; 
  setOpen: (open: boolean) => void;
  scope: Lebensraum; 
  position: XYPosition;
  onClose?: () => void;
  
}) {
  const { db, aktiveKarteId, hatZirkulaereAbhaengigkeit, addKnoten, addKartenKnoten } = useKartenStore();
  const { screenToFlowPosition } = useReactFlow();
  const open = argumente.open;
  const instanziierbareKarten = Object.values(db).filter(
    (karte) =>
      karte.id &&
      aktiveKarteId &&
      karte.scope !== "defined" &&
      karte.id !== aktiveKarteId &&
      !hatZirkulaereAbhaengigkeit(aktiveKarteId, karte.id)
  ); instanziierbareKarten.push({
    id: "L",
    name: "Logik Knoten",
  } as KartenDefinition); instanziierbareKarten.push({
    id: "E",
    name: "Element Knoten",
  } as KartenDefinition); instanziierbareKarten.push({
    id: "P",
    name: "Paremeter Knoten",
  } as KartenDefinition); instanziierbareKarten.push({
    id: "A",
    name: "Auswertungs Knoten",
  } as KartenDefinition); instanziierbareKarten.push({
    id: "R",
    name: "Rechen Knoten",
  } as KartenDefinition); 

  function onClick(e:React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    argumente.setOpen(true);
    console.log("neuer Knoten wird ausgewählt")
  };
  function handlePick(id: string) {
    const flowPos = screenToFlowPosition(argumente.position);
    if (id==="L") {
      console.log("LogikKnoten hinzufügen")
      const data = {ergebnisse: [false,false,false,false]} as LogikKnotenDaten
      addKnoten(KNOTEN.Logik,flowPos,data)
    } else if (id==="E") {
      console.log("Elementnoten hinzufügen")
      const data = {menge: "\\emptyset", objekt: "\\mathcal{X}"} as ElementKnotenDaten
      addKnoten(KNOTEN.Element,flowPos,data)
    } else if (id==="P") {
      console.log("ParameterKnoten hinzufügen")
      const data = {} as ParameterKnotenDaten
      addKnoten(KNOTEN.Parameter,flowPos,data)
    } else if (id==="A") {
      console.log("AuswertungsKnoten hinzufügen")
      const data = {} as AuswertungsKnotenDaten
      addKnoten(KNOTEN.Auswertung,flowPos,data)
    } else if (id==="R") {
      console.log("RechenKnoten hinzufügen")
      const data = {} as RechenKnotenDaten
      addKnoten(KNOTEN.Rechen,flowPos,data)
    } else {
      console.log("Karte hinzufügen")
      addKartenKnoten(id, flowPos);
      argumente.setOpen(false);
    }; argumente.onClose?.()
  };
  const onClose = () => {
    argumente.setOpen(false);
    argumente.onClose?.();
  }

  if (argumente.scope !== "defined") {
    return (
      <>
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
        ) }
      </>
    )
  }
}

