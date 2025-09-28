// ./src/Atlas/Anschlüsse/MultiAnschlussLeiste.tsx

import * as React from "react";
import { Position, useStoreApi } from "@xyflow/react";
import { useTheme } from "next-themes";

import { MultiAnschlussLeisteArgumente } from "@/Atlas/Anschlüsse.types";
import DatenAnschluss from "@/Atlas/Anschlüsse/DatenAnschluss";
import erhalteTypenFarben from "@/Daten/UI/typen";

const PILL_DICKE_PX = 26;     // Querachse der Kapsel
const PILL_STROKE_PX = 9;     // Linienbreite
const EDGE_GAP_PX   = 5;      // Abstand zur Node-Kante nach außen

export default function MultiAnschlussLeiste(a: MultiAnschlussLeisteArgumente) {
  const { nodeId, position, definition, handleIds, topPct, leftPct, widthPct, heightPct } = a;
  const istHorizontal = position === Position.Top || position === Position.Bottom;
  const { theme } = useTheme();
  const farbe = erhalteTypenFarben(definition.dtype, theme);
  const store = useStoreApi();

  // Anzahl Slots und Bandbreite (Prozent entlang der Seite)
  const N = Math.max(1, handleIds.length);
  const bandPct   = istHorizontal ? (widthPct  ?? 0) : (heightPct ?? 0);
  const centerPct = istHorizontal ? (leftPct   ?? 50) : (topPct   ?? 50);
  const startDerSlotsPct = centerPct - bandPct / 2;
  const slotBreitePct = N > 0 ? bandPct / N : 0;

  // Prozentposition eines Slots auf der Node-Kante
  const handlePosPct = (i: number) =>
    N === 1 ? centerPct : startDerSlotsPct + (i + 0.5) * slotBreitePct;

  // Distanz zwischen äußersten Slots
  const distPct = N > 1 ? (N - 1) * slotBreitePct : 0;
  const ersterPct = handlePosPct(0);

  // Start der Pill so, dass Halbkreise auf den äußeren Handle-Zentren sitzen:
  // Start = Position des ersten Handles minus Pill-Radius
  const pillStartCalc = `calc(${ersterPct}% - ${PILL_DICKE_PX / 2}px)`;
  const pillSizeCalc  = N > 1
    ? `calc(${distPct}% + ${PILL_DICKE_PX}px)`   // Distanz + 2 * Radius
    : `${PILL_DICKE_PX}px`;                       // N=1 → Kreis

  // Andocken an die Node-Kante inkl. 5px Außenabstand
  const anchor: React.CSSProperties = (() => {
    switch (position) {
      case Position.Top:
        return { top: `calc(0% - ${EDGE_GAP_PX}px)`, left: pillStartCalc, width: pillSizeCalc, height: PILL_DICKE_PX, transform: "translate(0, -100%)" };
      case Position.Bottom:
        return { top: `calc(100% + ${EDGE_GAP_PX}px)`, left: pillStartCalc, width: pillSizeCalc, height: PILL_DICKE_PX };
      case Position.Left:
        return { left: `calc(0% - ${EDGE_GAP_PX}px)`, top: pillStartCalc, height: pillSizeCalc, width: PILL_DICKE_PX, transform: "translate(-100%, 0)" };
      case Position.Right:
        return { left: `calc(100% + ${EDGE_GAP_PX}px)`, top: pillStartCalc, height: pillSizeCalc, width: PILL_DICKE_PX };
      default:
        return {};
    }
  })();

  // Pill optisch über dem Header, aber unter den Handles
  const pillStyle: React.CSSProperties = {
    position: "absolute",
    zIndex: 5, // Header < 5 < Handles(6)
    pointerEvents: "none",
    boxSizing: "border-box",
    border: `${PILL_STROKE_PX}px solid ${farbe}`,
    borderRadius: 9999,
    background: "transparent",
    ...anchor,
  };

  // Edges nach Layout-Änderung neu einmessen lassen
  React.useEffect(() => {
    if (!nodeId) return;
    const update = store.getState().updateNodeInternals;
    if (typeof update === "function") update(new Map([[nodeId, {} as any]]));
  }, [nodeId, N, leftPct, topPct, widthPct, heightPct, position, store]);

  return (
    <>
      {/* Pill unter den einzelnen Anschlüssen */}
      <div style={pillStyle} />

      {/* Handles exakt auf der Kante (kein style-Override, nur Prozent-Pos) */}
      {handleIds.map((hid, i) =>
        istHorizontal ? (
          <DatenAnschluss
            key={hid}
            handleId={hid}
            position={position}
            fluss={definition.fluss}
            datenTyp={definition.dtype}
            leftPct={handlePosPct(i)}
          />
        ) : (
          <DatenAnschluss
            key={hid}
            handleId={hid}
            position={position}
            fluss={definition.fluss}
            datenTyp={definition.dtype}
            topPct={handlePosPct(i)}
          />
        )
      )}
    </>
  );
}
