/// ./src/Atlas/Knoten/RechenKnoten.tsx

import { LaTeXKnotenArgumente, RechenKnotenArgumente } from "../Knoten.types";
import LaTeXKnoten from "./LaTeXKnoten";

export default function RechenKnoten(argumente: RechenKnotenArgumente) {
    const argument = {} as LaTeXKnotenArgumente
    return <LaTeXKnoten {...argument} />
}