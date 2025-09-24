/// ./src/Atlas/Knoten/ParameterKnoten.tsx

import { Position } from "@xyflow/react";
import { AnschlussNachSeite, Fluß, Variante } from "../Anschlüsse.types";
import { LaTeXKnotenArgumente, LaTeXKnotenDaten, ParameterKnotenArgumente } from "../Knoten.types";
import LaTeXKnoten from "./LaTeXKnoten";
import { Anschluss, istVertikal } from "./methoden";

export default function ParameterKnoten(argumente: ParameterKnotenArgumente) {
    const badge = "Parameter";
    function anschlussName() {
        const ausgabe = argumente.data.handleID ?? argumente.data.title;
        return ausgabe==="" ? "Hafen" : ausgabe;
    };
    const seite = istVertikal(Position.Top,Position.Right,argumente.data.dtype);
    const anschluss = Anschluss(anschlussName(),argumente.data.dtype,Fluß.Ausgang,Variante.Einzel)
    const anschlüsse = { [seite]: [anschluss] } as AnschlussNachSeite;
    const data = {...argumente.data, badge, anschlüsse, latex: argumente.data.latex} as LaTeXKnotenDaten;
    const argument = {...argumente,data} as LaTeXKnotenArgumente;
    return <LaTeXKnoten {...argument} />;
}