/// ./src/Atlas/Knoten/VariableKnoten.tsx

import { Position } from "@xyflow/react";
import { AnschlussNachSeite, Fluß, Variante } from "../Anschlüsse.types";
import { LaTeXKnotenArgumente, LaTeXKnotenDaten, VariableKnotenArgumente, VariableKnotenDaten } from "../Knoten.types";
import LaTeXKnoten from "./LaTeXKnoten";
import { Anschluss } from "./methoden";

export default function VariableKnoten(argumente: VariableKnotenArgumente) {
    const badge = "Variable";
    function anschlussName() {
        const ausgabe = argumente.data.handleID ?? argumente.data.title;
        return ausgabe==="" ? "Hafen" : ausgabe;
    };
    const anschlüsse = {
    [Position.Right]: [Anschluss(anschlussName(),argumente.data.dtype,Fluß.Ausgang,Variante.Einzel)], 
    } as AnschlussNachSeite;
    const data = {...argumente.data, badge, anschlüsse, latex: argumente.data.latex} as LaTeXKnotenDaten;
    const argument = {...argumente, data} as LaTeXKnotenArgumente;
    return <LaTeXKnoten {...argument} />
}