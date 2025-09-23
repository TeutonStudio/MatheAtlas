/// ./src/Atlas/Knoten/ElementKnoten.tsx

import { Position } from "@xyflow/react";

import { ElementKnotenArgumente, LaTeXKnotenArgumente, LaTeXKnotenDaten } from "@/Atlas/Knoten.types";
import LaTeXKnoten from "@/Atlas/Knoten/LaTeXKnoten";
import { Anschluss } from "@/Atlas/Knoten/methoden";
import { DatenTypen, Fluß, Variante } from "@/Atlas/Anschlüsse.types";

export default function ElementKnoten(argumente: ElementKnotenArgumente) {
    function wähle(entweder:any,oder:any) { return (argumente.data.def ?? false) ? entweder : oder }
    const title = wähle("soll Element?","ist Element?")
    const logikPos = wähle(Position.Bottom,Position.Top)
    const anschlüsse = {
        [Position.Left]: [
            Anschluss("objekt",DatenTypen.Unbekannt,Fluß.Eingang,Variante.Einzel),
            Anschluss("menge",DatenTypen.Menge,Fluß.Eingang,Variante.Einzel),
        ],[logikPos]: [
            Anschluss("ausgabe",DatenTypen.Logik,Fluß.Ausgang,Variante.Einzel),
        ]
    }
    const latex = argumente.data.objekt + "\\in " + argumente.data.menge
    const data = { title, badge: "Logik", latex, anschlüsse } as LaTeXKnotenDaten
    const argument = {...argumente, data} as LaTeXKnotenArgumente
    return <LaTeXKnoten {...argument} /> 
}
