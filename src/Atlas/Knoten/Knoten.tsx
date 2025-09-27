/// ./src/Atlas/Knoten/Knoten.tsx

import * as React from "react";
import { Position, type Node, type Edge } from "@xyflow/react";


import KnotenDebug, { KnotenAbzeichen, shallowArrayRefEqual, useEingangsDaten, type KnotenArgumente } from "@/Atlas/Knoten/methoden.tsx";
import { erhalteAnschlussNachSeite } from "@/Atlas/Anschlüsse/methoden.ts";
import { type AnschlussDefinition } from "@/Atlas/Anschlüsse.types.ts";

import AnschlussLeiste from "@/Atlas/Anschlüsse/AnschlussLeiste.tsx"
import { useKartenStore } from "@/Ordnung/DatenBank/KartenStore";
import { Daten } from "../Knoten.types";

const PORT_BAR = 20;
const SEITEN = [Position.Top,Position.Bottom,Position.Left,Position.Right];

export default function Knoten(argumente: KnotenArgumente): React.JSX.Element {
  const { id, basis, style, selected, children } = argumente;
  const anschlüsse = basis.anschlüsse;

  const eingangsDaten = useEingangsDaten(id);
  const updateNodeData = useKartenStore(s => s.updateNodeData);
  
  // Nur updaten, wenn sich die *Referenzen* der Eingangs-Daten geändert haben
  const prevRef = React.useRef<unknown[]>([]);
  React.useEffect(() => {
    if (shallowArrayRefEqual(prevRef.current, eingangsDaten)) return;
    prevRef.current = eingangsDaten;

    updateNodeData(id, (prev: any) => {
      // idempotent: nur schreiben, wenn nötig
      if (shallowArrayRefEqual(prev?.eingangsDaten ?? [], eingangsDaten)) return prev;
      return { ...prev, eingangsDaten };
    });
  }, [id, eingangsDaten, updateNodeData]);

  // console.log(`[Knoten.tsx] Rendering Knoten (ID: ${id})`, { id, basis, anschlüsse, style });

  
  const [paddingTop, paddingBottom, paddingLeft, paddingRight] = React.useMemo(() => {
    return SEITEN.map((seite:Position) => erhalteAnschlussNachSeite(anschlüsse,seite).length ? PORT_BAR : 8)
  }, [anschlüsse]);

  const border = selected ? "2px solid var(--ring, #60a5fa)" : "1px solid var(--border, #2b2f36)";
  const boxShadow = selected ? "0 0 0 3px color-mix(in oklab, var(--ring, #60a5fa) 30%, transparent)" : "none";
  const outerStyle = React.useMemo<React.CSSProperties>(() => ({
    ...outerStyleSt, border, boxShadow, paddingTop, paddingBottom, paddingLeft, paddingRight,
    ...style,
  } as React.CSSProperties), [paddingTop, paddingBottom, paddingLeft, paddingRight, style]);
  
  function KopfZeile() {
    const [title, badge] = [basis?.title ?? "", basis?.badge ?? ""]
    if (title || badge) {
      return (
        <div style={titleStyle}>
        <span>{title}</span>
        <KnotenAbzeichen badge={badge} />
      </div>
      )
    }
  };
  function Inhalt() {
    return <div style={{ padding: 12 }}>{children}</div>
  };
  function Anschlüsse() {
    const erhalteAnschluss = React.useCallback(
      (pos: Position): AnschlussDefinition[] => {
        return anschlüsse ? erhalteAnschlussNachSeite(anschlüsse, pos) : []
        }, [anschlüsse]
    );
    return (
      <>{ 
        SEITEN.map( (seite:Position) => {
          const argument = {nodeID: id, seite, anschlussListe: erhalteAnschluss}
          return <AnschlussLeiste {...argument} />
        } )
      }</>
    )
  }
  
  if (KnotenDebug) {
    console.log("selektiert Knoten",selected,id)
    // Debug
  }
  return (
    <div style={outerStyle} data-node-id={id}>
      <Anschlüsse />
      <KopfZeile />
      <Inhalt />
    </div>
  )
}


const outerStyleSt = {
  background: "var(--card, #111)",
  color: "var(--card-foreground, #e5e7eb)",
  borderRadius: 10,
  overflow: "visible",
  position: "relative",
  boxSizing: "border-box",
} as React.CSSProperties;

const titleStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
  fontWeight: 700,
  padding: "8px 10px",
  borderBottom: "1px solid var(--border, #2b2f36)",
  lineHeight: 1.2,
  userSelect: "none",
} as React.CSSProperties;
