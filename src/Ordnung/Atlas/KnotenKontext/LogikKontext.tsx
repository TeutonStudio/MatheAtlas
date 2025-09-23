/// ./src/Ordnung/Atlas/KnotenKontext/LogikKontext.tsx

import KontextAtlas from "@/Ordnung/Atlas/KnotenKontext/methoden.tsx";

import { useKartenStore } from "@/Ordnung/DatenBank/KartenStore.ts";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LogikTabelleDaten } from "@/Atlas/Knoten.types";
import { buildLogikAnschluesse, erzeugePermutationen } from "./methoden";
import { maxFälle } from "@/Atlas/Knoten/LogikTabelleKnoten";

export default function LogikKontext({id, data, readonly}:{
    id: string;
    data: LogikTabelleDaten;
    readonly?: boolean;
}) {
    const eingabeAnzahl = Number.isFinite(data.eingabeAnzahl) ? (data.eingabeAnzahl as number) : 0;

    const updateNodeData = useKartenStore(s => s.updateNodeData);
    const setInputCount = (countRaw: number) => {
        if (readonly) return;
        const eingabeAnzahl = Math.max(0, Math.min(maxFälle, Number(countRaw) | 0));
        const anschlüsse = buildLogikAnschluesse(eingabeAnzahl);
        const permutations = erzeugePermutationen(eingabeAnzahl);
        // Ergebnisse auf neue Länge anpassen
        const newLen = permutations.length;
        const old = Array.isArray(data.ergebnisse) ? data.ergebnisse : [];
        const ergebnisse = old.slice(0, newLen);
        while (ergebnisse.length < newLen) ergebnisse.push(false);

        updateNodeData(id, prev => ({
        ...prev,
        eingabeAnzahl,
        anschlüsse,
        ergebnisse,
        }));
    };
    const eingabeArgumente = {
        type: "number",
        min: 0, max: maxFälle,
        value: eingabeAnzahl,
        disabled: readonly,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => setInputCount(Number(e.target.value)),
    }

    return (
        <KontextAtlas
          überschrift={"Logik Tabelle"}
          beschreibung="Logische Wahrheitstabelle. Stell die Anzahl der Eingänge ein."
        ><div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 items-center gap-2">
                <Label>Anzahl Eingänge</Label>
                <Input {...eingabeArgumente} />
            </div>
        </div></KontextAtlas>
      );
}