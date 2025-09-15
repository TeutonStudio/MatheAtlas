// ./src/Daten/UI/Symbole.tsx

import * as React from "react";

/** Wir konstruieren in einer großen, gemütlichen 250×250-Leinwand um (0,0) */
// const BASIS_LEINWAND = 250;

/** Gleichseitiges Dreieck (Spitze nach oben), um (0,0) in Basiskoordinaten */
function dreieckPunkteBasis(R: number): string {
  const A = (-90 * Math.PI) / 180;
  const B = (150 * Math.PI) / 180;
  const C = ( 30 * Math.PI) / 180;
  const x1 = R * Math.cos(A), y1 = R * Math.sin(A);
  const x2 = R * Math.cos(B), y2 = R * Math.sin(B);
  const x3 = R * Math.cos(C), y3 = R * Math.sin(C);
  return `${x1},${y1} ${x2},${y2} ${x3},${y3}`;
}

/** Diamant-Quadrat (um 45° gedreht), um (0,0) in Basiskoordinaten */
function quadratPunkteBasis(R: number): string {
  const A = 0, B = Math.PI/2, C = Math.PI, D = 3*Math.PI/2;
  const x1 = R * Math.cos(A), y1 = R * Math.sin(A);
  const x2 = R * Math.cos(B), y2 = R * Math.sin(B);
  const x3 = R * Math.cos(C), y3 = R * Math.sin(C);
  const x4 = R * Math.cos(D), y4 = R * Math.sin(D);
  return `${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}`;
}

/**
 * „Halbkreisige“ Mengenklammer per Bézier.
 * Ziel: keine Rückwärtsbewegung am Start/Ende, runde Beule.
 * Wir nähern jede Hälfte mit einer kubischen Bézier an, deren Kontrollpunkte
 * sich wie bei der Viertelkreis-Approximation verhalten (Faktor ~0.5523).
 *
 * dir = -1 für links, +1 für rechts.
 *
 * Parameter:
 *  A       vertikale Halbhöhe (oben/unten) in Basiskoordinaten
 *  w       seitliche Ausladung der Endpunkte
 *  einschn Einzug (x) in der Mitte
 */
function klammerPfadHalbkreis(
  dir: -1 | 1,
  A = 110,
  w = 78,
  einschn = 46
): string {
  // Start/Ende der Klammer
  const x0 = dir * w,     y0 = -A;  // oben außen
  const xm = dir * einschn, ym = 0; // Mitte (Treffpunkt)
  const x5 = dir * w,     y5 =  A;  // unten außen

  // Viertelkreis-Faktor
  const k = 0.5522847498;

  // Obere Hälfte: Annäherung einer halbkreisigen Bewegung von oben außen zur Mitte.
  // Tangenten am Start vertikal, an der Mitte horizontal.
  const c1x = x0;            const c1y = y0 + k * A;   // kein „Zurückziehen“ in x-Richtung
  const c2x = xm - dir * k * (w - einschn);            // Richtung zur Mitte, horizontaler Auslauf
  const c2y = ym - k * A * 0.25;                       // leicht oberhalb der Mitte

  // Untere Hälfte: Spiegel der oberen.
  const c3x = xm - dir * k * (w - einschn);
  const c3y = ym + k * A * 0.25;
  const c4x = x5;
  const c4y = y5 - k * A;

  return [
    `M ${x0},${y0}`,
    `C ${c1x},${c1y} ${c2x},${c2y} ${xm},${ym}`,
    `C ${c3x},${c3y} ${c4x},${c4y} ${x5},${y5}`,
  ].join(" ");
}

/** LOGIK: Dreieck. targetRadius ist der Zielradius im 26×26-System. */
export function zeichneDreieckSkaliert(targetRadius = 9, cx = 13, cy = 13): React.ReactNode {
  const Rbasis = 100;
  const s = targetRadius / Rbasis;
  return (
    <g transform={`translate(${cx},${cy}) scale(${s})`}>
      <polygon points={dreieckPunkteBasis(Rbasis)} strokeWidth={9}/>
    </g>
  );
}

/** ZAHL: Diamant-Quadrat. */
export function zeichneQuadratSkaliert(targetRadius = 8.5, cx = 13, cy = 13): React.ReactNode {
  const Rbasis = 95;
  const s = targetRadius / Rbasis;
  return (
    <g transform={`translate(${cx},${cy}) scale(${s})`}>
      <polygon points={quadratPunkteBasis(Rbasis)} strokeWidth={9}/>
    </g>
  );
}

/** MENGE: zwei symmetrische, halbkreisig beulte Klammern. */
export function zeichneKlammernSkaliert(amplitude = 9, cx = 13, cy = 13): React.ReactNode {
  const A_BASIS = 110;              // Basis-Amplitude (große Leinwand)
  const s = amplitude / A_BASIS;    // Skalierung auf Handle-Größe
  const dLinks  = klammerPfadHalbkreis(-1, A_BASIS);
  const dRechts = klammerPfadHalbkreis(+1, A_BASIS);
  return (
    <g transform={`translate(${cx},${cy}) scale(${s})`}>
      <path d={dLinks}  strokeWidth={9}/>
      <path d={dRechts} strokeWidth={9}/>
    </g>
  );
}