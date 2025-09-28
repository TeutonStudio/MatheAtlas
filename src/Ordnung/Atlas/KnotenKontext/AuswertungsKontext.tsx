/// ./src/Ordnung/Atlas/KnotenKontext/AuswertungsKontext.tsx

import { useMemo } from "react";
import KontextAtlas from "@/Ordnung/Atlas/KnotenKontext/methoden";
import { useKartenStore } from "@/Ordnung/DatenBank/KartenStore";
import { DatenTypen } from "@/Atlas/Anschlüsse.types";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { type AuswertungsKnotenDaten } from "@/Atlas/Knoten.types";
import { Button } from "@/components/ui/button";

const TYPEN: DatenTypen[] = [DatenTypen.Zahl, DatenTypen.Menge, DatenTypen.Logik, DatenTypen.Term];
type AuswertungsArgumente = { id: string; data: AuswertungsKnotenDaten; readonly?: boolean }

export default function AuswertungsKontext(argumente: AuswertungsArgumente) {
    const { id, data, readonly } = argumente;
    const updateNodeData = useKartenStore(s => s.updateNodeData);
    const eingangsTyp = data?.eingangsTyp ?? DatenTypen.Zahl;
    const latex = data?.latex ?? "";

    function setEingangsTyp(next: DatenTypen) {
        if (readonly) return;
        console.log("Neuer Typ: ",next)
        updateNodeData(id, prev => ({ ...prev, eingangsTyp: next } as AuswertungsKnotenDaten));
    }

    const trigger = useMemo(() => <DropdownMenuTrigger disabled={readonly}>{eingangsTyp}</DropdownMenuTrigger>, [eingangsTyp, readonly]);

    return (
        <KontextAtlas
        überschrift="Auswertungs-Knoten"
        beschreibung={"Bestimme den Eingangstyp. \n Der Knoten erzeugt zusätzliche Eingänge \n für Schnittstellen im Upstream. \n Bei Variablen im Pfad gibt es einen Term-Ausgang.\n Unten siehst du die aktuell generierte LaTeX-Formel."}
        >
        <div className="grid gap-3">
            <div className="grid grid-cols-2 items-center gap-2">
            <Label>Eingangstyp</Label>
            <DropdownMenu>
                {trigger}
                <DropdownMenuContent>
                <DropdownMenuLabel>Typ auswählen</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {TYPEN.map(t => (
                    <DropdownMenuItem key={t} onSelect={() => setEingangsTyp(t)}>{t}</DropdownMenuItem>
                ))}
                </DropdownMenuContent>
            </DropdownMenu>
            </div>

            <div className="grid grid-cols-2 items-center gap-2">
            <Label>LaTeX</Label>
            <Input readOnly value={latex} />
            <Button onClick={() => console.log(data)}>Term-Ausgang</Button>
            </div>
        </div>
        </KontextAtlas>
    );
}
