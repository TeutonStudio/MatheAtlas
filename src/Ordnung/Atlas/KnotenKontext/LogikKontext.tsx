/// ./src/Ordnung/Atlas/KnotenKontext/LogikKontext.tsx

import KontextAtlas from "@/Ordnung/Atlas/KnotenKontext/methoden.tsx";

import { useKartenStore } from "@/Ordnung/DatenBank/KartenStore.ts";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { type LogikDaten } from "@/Atlas/Knoten.types";
import { buildLogikAnschluesse, erzeugePermutationen } from "@/Ordnung/Atlas/KnotenKontext/methoden";
import { maxFälle } from "@/Atlas/Knoten/LogikKnoten";
import { useState } from "react";


export const LOGIK_VARIANTEN = ["Tabelle", "und", "oder", "dann", "Auswählen"] as const;
export type LogikVariante = (typeof LOGIK_VARIANTEN)[number];


export default function LogikKontext({id, data, readonly}:{
    id: string;
    data: LogikDaten;
    readonly?: boolean;
}) {
    const [LogikVariante, setLogikVariante] = useState<LogikVariante>("Auswählen");

    function Inhalt() {
        switch (LogikVariante) {
            case "Tabelle":return <LogikTabelle id={id} data={data} readonly={readonly ?? false} />
            default: console.log("Dummheit muss weh tun")
        }
    }

    return (
        <KontextAtlas
          überschrift={"Logik Knoten"}
          beschreibung="Dieser Knoten eignet sich, um logische Werte mit einander zu verarbeiten"
        ><div className="flex flex-col gap-3">
            <Auswahl {...{get:LogikVariante,set:setLogikVariante}} />
            <Inhalt />
        </div></KontextAtlas>
      );
}

function Auswahl({get,set}:{get:LogikVariante,set:(name:LogikVariante) => void}) {
    function AuswahlTrigger() {
        return <DropdownMenuTrigger>{get}</DropdownMenuTrigger>
    };
    function AuswahlItem({name}:{name:LogikVariante}) {
        const ItemArgumente = {onSelect:() => set(name)}
        return <DropdownMenuItem {...ItemArgumente} >{name}</DropdownMenuItem>
    };
    return (
        <DropdownMenu>
            <AuswahlTrigger />
            <DropdownMenuContent>
                <DropdownMenuLabel>Logik variante auswählen</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {LOGIK_VARIANTEN.map((name:LogikVariante) => <AuswahlItem name={name} />)}
            </DropdownMenuContent>
        </DropdownMenu>
    )
};

function LogikTabelle({id,data,readonly}:{id:string,data:LogikDaten,readonly:boolean}) {
    const eingabeAnzahl = Number.isFinite(data.eingabeAnzahl) ? (data.eingabeAnzahl as number) : 0;
    const eingabeArgumente = {
        type: "number",
        min: 0, max: maxFälle,
        value: eingabeAnzahl,
        disabled: readonly,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => setInputCount(Number(e.target.value)),
    };
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

    return (
        <div className="grid grid-cols-2 items-center gap-2">
            <Label>Anzahl Eingänge</Label>
            <Input {...eingabeArgumente} />
        </div>
    )
}
