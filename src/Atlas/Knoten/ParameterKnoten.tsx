/// ./src/Atlas/Knoten/ParameterKnoten.tsx

import { Fluß } from "../Anschlüsse.types";
import { ParameterKnotenArgumente, ParameterKnotenDaten } from "../Knoten.types";
import { makeLaTeXNode, resolveStandardSeite } from "./methoden";

import { parameterZuLatex } from "@/Daten/Formeln/parameter";

export const ParameterKnoten = makeLaTeXNode<ParameterKnotenDaten,ParameterKnotenArgumente>({
  badge: "Parameter",
  seite: d => resolveStandardSeite(d.dtype),
  handleFluss: _ => Fluß.Ausgang,
  latex: d => parameterZuLatex(d.dtype, d.wert),
});
export default ParameterKnoten

/*
import { Position } from "@xyflow/react";
import { AnschlussNachSeite, Fluß, Variante } from "../Anschlüsse.types";
import { LaTeXKnotenArgumente, LaTeXKnotenDaten, ParameterKnotenArgumente } from "../Knoten.types";
import LaTeXKnoten from "./LaTeXKnoten";
import { Anschluss, istVertikal } from "./methoden";
import { parameterZuLatex } from "@/Daten/Formeln/parameter";

export default function ParameterKnoten(argumente: ParameterKnotenArgumente) {
  const badge = "Parameter";

  const anschlussName = (argumente.data.handleID ?? argumente.data.title) || "Hafen";
  const seite = istVertikal(Position.Top, Position.Right, argumente.data.dtype) as Position;

  const anschluss = Anschluss(anschlussName, argumente.data.dtype, Fluß.Ausgang, Variante.Einzel);
  const anschlüsse = { [seite]: [anschluss] } as AnschlussNachSeite;

  const latex = parameterZuLatex(argumente.data.dtype, argumente.data.wert);
  const data = {...argumente.data, badge, anschlüsse, latex} as LaTeXKnotenDaten;
  const argument = {...argumente, data} as LaTeXKnotenArgumente;
  return <LaTeXKnoten {...argument} />;
}
*/