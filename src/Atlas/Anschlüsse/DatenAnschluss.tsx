// ./src/Anschlüsse/DatenAnschluss.tsx

import * as React from "react";
import {
  Position,
  Handle,
  useReactFlow,
  type Edge,
  type Connection,
} from "@xyflow/react";

import { type DatenAnschlussArgumente } from "@/Atlas/Anschlüsse.types.ts";
import { istValideVerbindung } from "@/Atlas/Anschlüsse/methoden.ts";
import erhalteTypenFarben, { erhalteSVG } from "@/Daten/UI/typen.tsx";
import { useTheme } from "next-themes";

const SVG_GROESSE = 26;

/**
 * DatenAnschluss:
 * - Stellt einen einzelnen, interaktiven Verbindungspunkt dar.
 * - Nutzt eine robuste Stil-Funktion, um sich korrekt an der Kante des Knotens auszurichten.
 */
export default function DatenAnschluss(argumente: DatenAnschlussArgumente) {
  const { handleId, position, fluss, datenTyp, leftPct, topPct, style } = argumente;
  const { getNodes, getEdges } = useReactFlow();
  const { theme } = useTheme();

//  const theme_str = theme === "dark" ? "dark" : "light"
  const farbe = erhalteTypenFarben(datenTyp,theme) // = typenFarben[datenTyp][theme_str]; // TODO 

  const istGueltigeVerbindung = React.useCallback(
    (c: Connection | Edge) => istValideVerbindung(c, getNodes(), getEdges()),
    [getNodes, getEdges]
  );


  const style2 = React.useMemo(() => {
    const basisStil: React.CSSProperties = {
        position: "absolute",
        background: "transparent",
        transformOrigin: "center center"
    };
    const svgVerschiebung = `-${SVG_GROESSE / 2}px`;

    switch (position) {
        case Position.Top:
            return { ...basisStil, left: `${leftPct}%`, top: svgVerschiebung, transform: 'translateX(-50%)' };
        case Position.Bottom:
            return { ...basisStil, left: `${leftPct}%`, bottom: svgVerschiebung, transform: 'translateX(-50%)' };
        case Position.Left:
            return { ...basisStil, top: `${topPct}%`, left: svgVerschiebung, transform: 'translateY(-50%)' };
        case Position.Right:
            return { ...basisStil, top: `${topPct}%`, right: svgVerschiebung, transform: 'translateY(-50%)' };
        default:
            return basisStil;
    }
}, [position, leftPct, topPct]);


  return (
    <div style={style ?? style2}>
      <svg
        width={SVG_GROESSE}
        height={SVG_GROESSE}
        viewBox={`0 0 ${SVG_GROESSE} ${SVG_GROESSE}`}
        aria-hidden
        style={{ display: "block", pointerEvents: "none" }}
      >
        <g fill="none" stroke={farbe} strokeWidth={2}>
          {erhalteSVG(datenTyp)}
        </g>
      </svg>

      <Handle
        id={handleId}
        type={fluss}
        position={position}
        isValidConnection={istGueltigeVerbindung}
        style={griffStil(farbe)}
      />
    </div>
  );
}

// --- Hilfsfunktionen für Layout und Stil ---

/**
 * Stellt die korrekte Positionierungslogik wieder her.
 * Positioniert den Anschluss bündig außerhalb der Node-Grenzen.
 * Unterscheidet zwischen dem Einsatz als "standalone" Anschluss und innerhalb einer Multi-Leiste.
 */
function umhuellungsStil(
  position: Position,
  linksProzent: number | undefined,
  obenProzent: number | undefined
): React.CSSProperties {
  // Wenn keine Positionswerte übergeben werden, wird der Anschluss innerhalb einer
  // MultiAnschlussLeiste gerendert und benötigt keine eigene absolute Positionierung.
  if (linksProzent === undefined && obenProzent === undefined) {
    return { zIndex: 5 };
  }

  // Für "standalone" Anschlüsse wird die Position absolut zum Knoten gesetzt.
  const style: React.CSSProperties = {
    position: "absolute",
    zIndex: 5,
  };

  switch (position) {
    case Position.Left:
      style.left = "0px";
      style.top = `${obenProzent ?? 50}%`;
      style.transform = "translate(-100%, -50%)"; // Verschiebt um die eigene Breite nach links außen
      break;
    case Position.Right:
      style.left = "100%";
      style.top = `${obenProzent ?? 50}%`;
      style.transform = "translate(0, -50%)"; // Verschiebt die Mitte zur Kante, bleibt aber außen
      break;
    case Position.Top:
      style.top = "0px";
      style.left = `${linksProzent ?? 50}%`;
      style.transform = "translate(-50%, -100%)"; // Verschiebt um die eigene Höhe nach oben außen
      break;
    case Position.Bottom:
      style.top = "100%";
      style.left = `${linksProzent ?? 50}%`;
      style.transform = "translate(-50%, 0)"; // Verschiebt die Mitte zur Kante, bleibt aber außen
      break;
  }

  return style;
}

function griffStil(farbe: string): React.CSSProperties {
  return {
    pointerEvents: "auto",
    background: farbe,
    border: "1px solid rgba(0,0,0,.35)",
    width: 3,
    height: 3,
    borderRadius: "50%",
    zIndex: 6,
    position: "absolute",
    left: "50%", top: "50%",
    transform: "translate(-50%, -50%)",
  };
}
