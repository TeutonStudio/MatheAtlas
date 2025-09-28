/// ./src/Atlas/Knoten/RechenKnoten.tsx

import { LaTeXKnotenArgumente, LaTeXKnotenDaten, RechenKnotenArgumente } from "../Knoten.types";
import LaTeXKnoten from "./LaTeXKnoten";

export default function RechenKnoten(argumente: RechenKnotenArgumente) {
    const title = "Rechnen"; const badge = "Zahl"
    const data = {...argumente.data, title, badge} as LaTeXKnotenDaten
    const argument = {...argumente, data} as LaTeXKnotenArgumente
    return <LaTeXKnoten {...argument} />
}