// ./src/Atlas/Knoten/Knoten.tsx

import * as React from "react";
import { Position } from "@xyflow/react";

import { Badge } from "@/components/ui/badge";

import KnotenDebug, { type KnotenArgumente } from "@/Atlas/Knoten/methoden.tsx";
import { erhalteAnschlussNachSeite } from "@/Atlas/Anschlüsse/methoden.ts";
import { type AnschlussDefinition } from "@/Atlas/Anschlüsse.types.ts";

import AnschlussLeiste from "@/Atlas/Anschlüsse/AnschlussLeiste.tsx"
import { _anschlüsse } from "../Karten/Vorlagen/methoden";

const PORT_BAR = 20;

export default function Knoten(argumente: KnotenArgumente): React.JSX.Element {
    const { id, basis, style, selected, children } = argumente;
    const anschlüsse = basis.anschlüsse;

    // console.log(`[Knoten.tsx] Rendering Knoten (ID: ${id})`, { id, basis, anschlüsse, style });

    const erhalteAnschluss = React.useCallback(
      (pos: Position): AnschlussDefinition[] => {
        return anschlüsse
          ? erhalteAnschlussNachSeite(anschlüsse, pos)
          : []
        }, [anschlüsse]
    );
    const [padTop, padBottom, padLeft, padRight] = React.useMemo(() => {
      return [
        erhalteAnschluss(Position.Top).length ? PORT_BAR : 8,
        erhalteAnschluss(Position.Bottom).length ? PORT_BAR : 8,
        erhalteAnschluss(Position.Left).length ? PORT_BAR : 8,
        erhalteAnschluss(Position.Right).length ? PORT_BAR : 8,
      ] as const;
    }, [erhalteAnschluss]);

    
    const outerStyle = React.useMemo<React.CSSProperties>(() => ({
      border: selected
      ? "2px solid var(--ring, #60a5fa)"          // sichtbarer Rand bei Auswahl
      : "1px solid var(--border, #2b2f36)",
      boxShadow: selected
      ? "0 0 0 3px color-mix(in oklab, var(--ring, #60a5fa) 30%, transparent)" 
      : "none",
      //    border: "1px solid var(--border, #2b2f36)",
      background: "var(--card, #111)",
      color: "var(--card-foreground, #e5e7eb)",
      borderRadius: 10,
      overflow: "visible",
      position: "relative",
      boxSizing: "border-box",
      paddingTop: padTop,
      paddingBottom: padBottom,
      paddingLeft: padLeft,
      paddingRight: padRight,
      ...style,
    }), [padTop, padBottom, padLeft, padRight, style]);
    
    const [title, badge] = [basis?.title ?? "", basis?.badge ?? ""]
    const header = (title || badge) ? (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        fontWeight: 700,
        padding: "8px 10px",
        borderBottom: "1px solid var(--border, #2b2f36)",
        lineHeight: 1.2,
        userSelect: "none",
      }}>
      <span>{title}</span>
      {badge ? <Badge variant="outline">{badge}</Badge> : null}
    </div>
  ) : null;
  
  if (KnotenDebug) {
    console.log("selektiert Knoten",selected,id)
    // Debug
  }
  return (
    <div style={outerStyle} data-node-id={id}>
        <AnschlussLeiste nodeId={id} seite={Position.Top}    anschlussListe={erhalteAnschluss} />
        <AnschlussLeiste nodeId={id} seite={Position.Bottom} anschlussListe={erhalteAnschluss} />
        <AnschlussLeiste nodeId={id} seite={Position.Left}   anschlussListe={erhalteAnschluss} />
        <AnschlussLeiste nodeId={id} seite={Position.Right}  anschlussListe={erhalteAnschluss} />
        {header}
        <div style={{ padding: 12 }}>{children}</div>
    </div>
  )
}
