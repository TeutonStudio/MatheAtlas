/// ./src/Ordnung/Atlas/KnotenKontext/KarteKontext.tsx

import { KartenKnotenDaten } from "@Knoten.types";
import KontextAtlas from "@Atlas/KnotenKontext/methoden.tsx";
//import { useKartenStore } from "@/Ordnung/DatenBank/KartenStore.ts";

export default function KarteKontext({id,data}:{id:string,data:KartenKnotenDaten}) {
//    const { findKarte } = useKartenStore();
//    const karte = findKarte(id);
//    if (!karte) { return }
    const karte = data.karte.definition

    console.log(id)
    return (
        <KontextAtlas
          überschrift={karte.name}
          beschreibung="TODO"
        ><div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 items-center gap-2">
                
            </div>
        </div></KontextAtlas>
    )
}