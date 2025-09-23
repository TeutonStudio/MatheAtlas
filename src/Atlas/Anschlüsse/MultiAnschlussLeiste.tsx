// ./src/Atlas/Anschlüsse/MultiAnschlussLeiste.tsx

import * as React from "react";
import { Position } from "@xyflow/react";
import { useTheme } from "next-themes";

import { type AnschlussDefinition } from "@/Atlas/Anschlüsse.types.ts";
import DatenAnschluss from "@/Atlas/Anschlüsse/DatenAnschluss.tsx";

import erhalteTypenFarben from "@/Daten/UI/typen.tsx";

/**
 * Die Props wurden überarbeitet, um die Komponente "dumm" zu machen.
 * Sie erhält nun alle zur Darstellung nötigen Informationen von der übergeordneten AnschlussLeiste.
 */
export type MultiAnschlussLeisteProps = {
  nodeId: string;
  position: Position;
  definition: AnschlussDefinition;
  handleIds: string[]; // Definitive, von der AnschlussLeiste berechnete Liste von Handle-IDs
  topPct?: number;
  leftPct?: number;
  widthPct?: number;
  heightPct?: number;
};

export default function MultiAnschlussLeiste(argumente: MultiAnschlussLeisteProps) {
  const { position, definition, handleIds, topPct, leftPct, widthPct, heightPct } = argumente;
  //const { dtype } = definition;
  const { theme } = useTheme();
  const farbe = erhalteTypenFarben(definition.dtype,theme)
  const istHorizontal = position === Position.Top || position === Position.Bottom;

  // Der Stil für den Hauptcontainer ("Pill").
  // Er verwendet die von der AnschlussLeiste übergebenen prozentualen Werte für Position und Größe.
  const leisteStil: React.CSSProperties = {
    position: "absolute",
    top: topPct !== undefined ? `${topPct}%` : undefined,
    left: leftPct !== undefined ? `${leftPct}%` : undefined,
    width: widthPct !== undefined ? `${widthPct}%` : undefined,
    height: heightPct !== undefined ? `${heightPct}%` : undefined,
    transform: `translate(-50%, -50%)`, // Zentriert die Pill auf ihrem Ankerpunkt
    zIndex: 4,
    pointerEvents: "auto", // Erlaubt Maus-Events für die Handles im Inneren
  };

  // Bestimmt den Radius für die abgerundeten Ecken der Pill.
  const rx = istHorizontal ? undefined : "50%";
  const ry = istHorizontal ? "50%" : undefined;

  /**
   * Berechnet den Stil für einen einzelnen Handle (Slot) innerhalb der Pill.
   * Die Positionierung erfolgt relativ zur Größe der Pill.
   */
  const slotStil = (rang: number): React.CSSProperties => {
    const slotAnzahl = handleIds.length;
    // Berechnet den Mittelpunkt des Slots als prozentualen Wert entlang der Hauptachse
    const positionPct = ((rang + 0.5) / slotAnzahl) * 100;

    return {
      position: "absolute",
      top: istHorizontal ? '50%' : `${positionPct}%`,
      left: istHorizontal ? `${positionPct}%` : '50%',
      // Zentriert den Handle auf dem berechneten Punkt
      transform: 'translate(-50%, -50%)',
      zIndex: 5,
    };
  };

  return (
    <div style={leisteStil}>
      <svg
        aria-hidden
        width="100%"
        height="100%"
        preserveAspectRatio="none" // Sorgt dafür, dass das Rechteck den Container füllt
        viewBox="0 0 100 100"
        style={{ display: "block", pointerEvents: "none", position: "absolute" }}
      >
        <rect
          x="0"
          y="0"
          width="100"
          height="100"
          rx={rx}
          ry={ry}
          fill="rgba(0,0,0,.05)"
          stroke={farbe}
          strokeWidth="1.5" // Etwas dicker für bessere Sichtbarkeit
          vectorEffect="non-scaling-stroke" // Verhindert, dass die Umrandung bei Skalierung dicker/dünner wird
        />
      </svg>

      {/* Iteriert über die von der AnschlussLeiste übergebene Liste von Handle-IDs */}
      {handleIds.map((handleId, rang) => (
        <DatenAnschluss
          key={handleId}
          handleId={handleId}
          position={position}
          fluss={definition.fluss}
          datenTyp={definition.dtype}
          // Der berechnete Stil wird direkt übergeben, um die Standard-Positionierung
          // des DatenAnschlusses zu überschreiben.
          style={slotStil(rang)}
        />
      ))}
    </div>
  );
}
