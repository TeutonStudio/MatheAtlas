/// ./src/Atlas/Knoten/VariableKnoten.tsx

import { Fluß } from "../Anschlüsse.types";
import { VariableKnotenArgumente, VariableKnotenDaten } from "../Knoten.types";
import { makeLaTeXNode, resolveStandardSeite } from "./methoden";


const VariableKnoten = makeLaTeXNode<VariableKnotenDaten,VariableKnotenArgumente>({
  badge: "Variable",
  seite: d => resolveStandardSeite(d.dtype),
  handleFluss: _ => Fluß.Ausgang,
  latex: d => d.latex,
});
export default VariableKnoten

/*
import { Position } from "@xyflow/react";
import { AnschlussNachSeite, Fluß, Variante } from "../Anschlüsse.types";
import { LaTeXKnotenArgumente, LaTeXKnotenDaten, VariableKnotenArgumente, VariableKnotenDaten } from "../Knoten.types";
import LaTeXKnoten from "./LaTeXKnoten";
import { Anschluss, istVertikal } from "./methoden";

export default function VariableKnoten(argumente: VariableKnotenArgumente) {
    const badge = "Variable";
    function anschlussName() {
        const ausgabe = argumente.data.handleID ?? argumente.data.title;
        return ausgabe==="" ? "Hafen" : ausgabe;
    };
    const latex = argumente.data.latex;
    const seite = istVertikal(Position.Top,Position.Right,argumente.data.dtype);
    const anschluss = Anschluss(anschlussName(),argumente.data.dtype,Fluß.Ausgang,Variante.Einzel)
    const anschlüsse = { [seite]: [anschluss] } as AnschlussNachSeite;
    const data = {...argumente.data, badge, anschlüsse, latex} as LaTeXKnotenDaten;
    const argument = {...argumente, data} as LaTeXKnotenArgumente;
    return <LaTeXKnoten {...argument} />
}
    */