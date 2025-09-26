/// ./src/Atlas/Knoten/ParameterKnoten.tsx

import { Position } from "@xyflow/react";
import { AnschlussNachSeite, Fluß, Variante } from "../Anschlüsse.types";
import { LaTeXKnotenArgumente, LaTeXKnotenDaten, ParameterKnotenArgumente } from "../Knoten.types";
import LaTeXKnoten from "./LaTeXKnoten";
import { Anschluss, istVertikal } from "./methoden";
import { parameterZuLatex } from "@/Daten/Formeln/parameter";

export default function ParameterKnoten(argumente: ParameterKnotenArgumente) {
  const { data } = argumente;
  const badge = "Parameter";

  const anschlussName = (data.handleID ?? data.title) || "Hafen";
  const seite = istVertikal(Position.Top, Position.Right, data.dtype) as Position;

  const anschluss = Anschluss(anschlussName, data.dtype, Fluß.Ausgang, Variante.Einzel);
  const anschlüsse = { [seite]: [anschluss] } as AnschlussNachSeite;

  const latex = parameterZuLatex(data.dtype, data.wert);
  const dataMitLatex = { ...data, badge, anschlüsse, latex } as LaTeXKnotenDaten;

  const argument = { ...argumente, data: dataMitLatex } as LaTeXKnotenArgumente;
  return <LaTeXKnoten {...argument} />;
}
