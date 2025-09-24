/// ./src/Ordnung/Atlas/KnotenKontext/ParameterKontext.tsx

import { ParameterKnotenDaten } from "@/Atlas/Knoten.types";
import KontextAtlas from "./methoden";

export default function ParameterKontext({id,data}:{id:string,data:ParameterKnotenDaten}) {
    console.log(id,data)
    return (
        <KontextAtlas
          überschrift={data.title ?? ""}
          beschreibung="Parameter Knoten dienen zur definition von parametern."
        ><div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 items-center gap-2">
                
            </div>
        </div></KontextAtlas>
    );
}