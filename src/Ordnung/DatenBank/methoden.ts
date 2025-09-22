/// ./src/Ordnung/DatenBank/methoden.ts

import {
  addEdge,
  reconnectEdge,
  type Node,
  type Edge,
  type Connection,
} from "@xyflow/react";
import { nanoid } from "nanoid";
import { KNOTEN, Lebensraum, type KartenDefinition, type Schnittstelle } from "@/Atlas/Karten.types.ts";
import knotenBibliothek, { vorlageLeer } from "@/Atlas/Karten/Vorlagen/KartenVorlage";
import { KartenState } from "../datenbank.types";

// Entfernt alle Edges, die auf dasselbe Ziel-Handle zeigen, und fügt die neue Verbindung hinzu.
export function addEdgeWithSingleTarget(conn: Connection, edges: Edge[]): Edge[] {
  if (!conn.target || !conn.targetHandle) return edges;

  // Optional: nur für Fluß.Eingang erzwingen
  // const parsed = erhalteAnschluss(conn.targetHandle);
  // const fluss = parsed[ID_TEILE_INDICES.FLUSS];
  // if (fluss !== "Eingang") return addEdge({ ...conn, id: `e-${nanoid()}` }, edges);

  const cleaned = edges.filter(
    e => !(e.target === conn.target && e.targetHandle === conn.targetHandle)
  );
  return addEdge({ ...conn, id: `e-${nanoid()}` }, cleaned);
}

// Reconnect-Version: aktualisiert die bestehende Edge und räumt Konflikte am neuen Ziel auf
export function reconnectWithSingleTarget(oldEdge: Edge, conn: Connection, edges: Edge[]): Edge[] {
  if (!conn.target || !conn.targetHandle) return edges;

  // erst alte Edge versetzen
  const updated = reconnectEdge(oldEdge, conn, edges);

  // dann alle anderen Edges killen, die dasselbe target/handle blockieren
  return updated.filter(
    e => e.id === oldEdge.id || !(e.target === conn.target && e.targetHandle === conn.targetHandle)
  );
}

// Hilfsfunktion: finde Bibliothekskarte per slug ODER per id
export function findBibliotheksKarte(id: string): KartenDefinition | undefined {
  console.log("öffne Karte "+id)
  function CheckNodes(_byKey: KartenDefinition): KartenDefinition {
    const label = "Mit dem ungeöffnetem Inhalt: "
    console.log(label,_byKey.nodes)
    return _byKey
  }
  let byKey = knotenBibliothek[id] as KartenDefinition | undefined;
  const namensliste = Object.values(knotenBibliothek).map( k => k.name) 
  
  if (byKey) { 
    return CheckNodes(byKey)
  } else { byKey = Object.values(knotenBibliothek).find(k => k.id === id) ?? undefined };
  if (byKey) { 
    return CheckNodes(byKey)
  } else { 
    console.log(id+" existiert nicht in "+namensliste)
    return undefined
  };
}

// ---------- Utils ----------
export const cloneNodes = (ns: Node[]) => structuredClone(ns).map(n => ({ ...n, draggable: true }));
export const cloneEdges = (es: Edge[]) => structuredClone(es);


// ---------- Store ----------
export function indexById(rec: Record<string, KartenDefinition>) {
  const out: Record<string, KartenDefinition> = {};
  for (const k of Object.values(rec)) out[k.id] = k;
  return out;
}


export function collectDirtyIds(db: KartenState["db"], geöffnet: KartenState["geöffnet"]) {
  return Object.entries(geöffnet)
    .filter(([id, off]) => !!off && off.dirty)
    .map(([id]) => id);
}

type Getter = () => KartenState
type Setter = (partial: KartenState | Partial<KartenState> | ((state: KartenState) => KartenState | Partial<KartenState>), replace?: boolean | undefined) => void

export function closeAllExceptIds(get: Getter,set: Setter, keepIds: string[]) {
  const { geöffnet, aktiveKarteId, verlauf } = get();
  const keep = new Set(keepIds);
  const neueGeöffnet: typeof geöffnet = {};
  for (const [id, offene] of Object.entries(geöffnet)) {
    if (keep.has(id)) neueGeöffnet[id] = offene;
  }
  const neuerVerlauf = verlauf.filter(v => keep.has(v.id));
  const neueAktive = keepIds.length ? keepIds[keepIds.length - 1] : null;
  set({ geöffnet: neueGeöffnet, verlauf: neuerVerlauf, aktiveKarteId: neueAktive });
}

export function forceOpen(get: Getter,set: Setter, targetId: string, name?: string) {
  const { db, geöffnet, verlauf } = get();
  const karte = db[targetId];
  if (!karte) return;

  const neueGeöffnete = { ...geöffnet };
  if (!neueGeöffnete[targetId]) {
    const nodes = structuredClone(karte.nodes ?? []).map(n => ({
      ...n,
      deletable: karte.scope === "private",
      draggable: karte.scope !== "defined",
      selectable: karte.scope !== "defined",
    }));
    const edges = structuredClone(karte.edges ?? []);
    neueGeöffnete[targetId] = { nodes, edges, dirty: false, scope: karte.scope };
  }

  let neuerVerlauf = [...verlauf];
  const idx = neuerVerlauf.findIndex(v => v.id === targetId);
  if (idx !== -1) {
    neuerVerlauf = neuerVerlauf.slice(0, idx + 1);
  } else {
    neuerVerlauf.push({ id: targetId, name: name ?? karte.name });
  }

  set({ aktiveKarteId: targetId, geöffnet: neueGeöffnete, verlauf: neuerVerlauf });
}

// SPEICHER-FLOW: zeigt EINEN Multi-Dialog
export function promptMultiSaveOrDiscard(get: Getter,set: Setter, cardIdsToClose: string[], onContinue: () => void) {
  const { db } = get();
  const cards = cardIdsToClose.map(id => ({ id, name: db[id]?.name ?? id }));
  const anfrage = {
    type: 'multi-speichern' as const,
    cardIds: cardIdsToClose,
    cards,
    onSaveAll: () => {
      // alle speichern
      cardIdsToClose.forEach(id => get().save(id));
      get().processNextDialog();
      onContinue();
    },
    onDiscardAll: () => {
      // markieren als nicht dirty
      const { geöffnet } = get();
      const neu = { ...geöffnet };
      for (const id of cardIdsToClose) {
        if (neu[id]) neu[id] = { ...neu[id], dirty: false };
      }
      set({ geöffnet: neu });
      get().processNextDialog();
      onContinue();
    },
    onCancel: () => {
      get().processNextDialog();
      // nichts weiter
    },
  };
  set(state => ({ dialogAnfragen: [...state.dialogAnfragen, anfrage] }));
}

export function decorateNodesForScope(nodes: Node[] = [], scope: Lebensraum): Node[] {
  const deletable = scope === "private";
  const movable = scope !== "defined";
  return nodes.map(n => ({ 
    ...n, 
    deletable, 
    draggable: movable, 
    selectable: movable,
  }));
}
