/// ./src/Atlas/Anschlüsse/methoden.ts

import { Position, getOutgoers, type Connection, type Node, type Edge } from "@xyflow/react";
import { AnschlussNachSeite, DatenTypen, type AnschlussDefinition } from "@/Atlas/Anschlüsse.types.ts";

export const SEPARATOR = "_$_";

/**
 * Definiert die feste Reihenfolge der ID-Bestandteile. Die ID des Knotens ist NICHT Teil der Handle-ID.
 * Eine Handle-ID muss nur innerhalb ihres Knotens eindeutig sein.
 *
 * - 0: anschlussName (string) - Die 'id' aus der AnschlussDefinition
 * - 1: typ (DatenTypen)
 * - 2: fluss (Fluß)
 * - 3: variante (Variante)
 * - 4: index (number, optional) - Nur für Multi-Anschlüsse
 */
export const ID_TEILE_INDICES = {
    ANSCHLUSS_NAME: 0,
    TYP: 1,
    FLUSS: 2,
    VARIANTE: 3,
    INDEX: 4,
};


/**
 * Erstellt eine standardisierte Handle-ID aus einem Array von Teilen.
 * @param teile Ein Array, das die ID-Bestandteile in der durch ID_TEILE_INDICES definierten Reihenfolge enthält.
 * @returns Eine kombinierte Handle-ID als String.
 */
export function erhalteId(teile: (string | number | undefined)[]): string {
    return teile.filter(t => t !== undefined).join(SEPARATOR);
}

/**
 * Zerlegt eine Handle-ID in ihre strukturierten Bestandteile.
 * @param handleId Die zu zerlegende Handle-ID.
 * @returns Ein Array mit den ID-Bestandteilen.
 */
export function erhalteAnschluss(handleId: string): string[] {
    return handleId.split(SEPARATOR);
}



export function erhalteAnschlussNachSeite(
    anschlüsse: AnschlussNachSeite | undefined,
    seite: Position
  ): AnschlussDefinition[] {
    return anschlüsse?.[seite] ?? [];
  }


/**
 * Prüft die komplette Validität einer Verbindung, inklusive Zyklus-Erkennung.
 */
export function istValideVerbindung(
    c: Connection | Edge, 
    knoten: Node[], kanten: Edge[],
  ): boolean {
    // 1. Grundlegende Prüfung der Kompatibilität (Typ, Fluss)
    if (c.source === c.target ) return false;
    if (!c.sourceHandle || !c.targetHandle) return false;
    
    const sourceParsed = erhalteAnschluss(c.sourceHandle);
    const targetParsed = erhalteAnschluss(c.targetHandle);
    
    function erhalteDTyp(handle:string[]): string { return handle[ID_TEILE_INDICES.TYP] }
    function erhalteFluß(handle:string[]): string { return handle[ID_TEILE_INDICES.FLUSS] }
    function bekannt(handle:string[]): boolean { return erhalteDTyp(handle) !== DatenTypen.Unbekannt }
    
    // Prüfen, ob die IDs valide zerlegt werden konnten (mindestens 4 Teile müssen vorhanden sein)
    const UngültigeIDs = sourceParsed.length < 4 || targetParsed.length < 4
    if (UngültigeIDs) { console.log("IDs",sourceParsed,targetParsed) }
    // Beide DatenTypen müssen bekannt sein
    const BeideBekannt = bekannt(sourceParsed) && bekannt(targetParsed)
    // Datentypen müssen übereinstimmen (Index 1)
    const TypenUngleich = erhalteDTyp(sourceParsed) !== erhalteDTyp(targetParsed)
    // Fluss muss komplementär sein (z.B. source und target) (Index 2)
    const FlußGleich = erhalteFluß(sourceParsed) === erhalteFluß(targetParsed)
    // 2. Zyklus-Prüfung
    const zielKnoten = knoten.find((node) => node.id === c.target);  
    
    if (UngültigeIDs || (TypenUngleich && BeideBekannt) || FlußGleich || !zielKnoten) return false;
    
    // Erstelle eine temporäre Kantenliste, die die neue Verbindung enthält
    const tempKanten = [...kanten, c as Edge];

    const hatZyklus = (node: Node, besuchte = new Set<string>()): boolean => {
        if (besuchte.has(node.id)) return false;
        besuchte.add(node.id);

        for (const nachfolger of getOutgoers(node, knoten, tempKanten)) {
            if (nachfolger.id === c.source) return true;
            if (hatZyklus(nachfolger, besuchte)) return true;
        }
        return false;
    };
  
    return !hatZyklus(zielKnoten);
}
