/// ./src/Ordnung/Atlas/KnotenKontext/LogikKontext.tsx

import { VariableKnotenDaten } from "@/Atlas/Knoten.types";
import KontextAtlas from "./methoden";

export default function VariableKontext({id,data}:{id:string,data:VariableKnotenDaten}) {
    console.log(id,data)
    return (
        <KontextAtlas
          überschrift={data.title ?? ""}
          beschreibung="Variablen Knoten dienen zur definition von variablen."
        ><div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 items-center gap-2">
                
            </div>
        </div></KontextAtlas>
    );
}