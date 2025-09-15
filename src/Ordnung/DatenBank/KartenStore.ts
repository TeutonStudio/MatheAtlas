// ./src/Ordnung/DatenBank/KartenStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type OnEdgesChange,
  type OnNodesChange,
  type Node,
  type XYPosition,
} from "@xyflow/react";
import { nanoid } from "nanoid";
import { toast } from "sonner";

import { KNOTEN, type KartenDefinition, type Schnittstelle } from "@/Atlas/Karten.types.ts";
import knotenBibliothek, { vorlageLeer } from "@/Atlas/Karten/KartenVorlage.ts";
import { type User } from "@/Ordnung/programm.types.ts";
import { hashPassword, generateUserId } from "@/Ordnung/Benutzer/utils";


// Hilfsfunktion: finde Bibliothekskarte per slug ODER per id
function findBibliotheksKarte(id: string): KartenDefinition | undefined {
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


// ---------- Types ----------
type OffeneKarte = {
  nodes: Node[];
  edges: Edge[];
  dirty: boolean;
  //readonly?: boolean; // neu
  scope: "private" | "public" | "defined";
};

type Verlauf = { id: string; name: string };

type DialogAnfrageSpeichern = {
  type: 'speichern';
  cardId: string;
  cardName: string;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
};

type DialogAnfrageUmbenennen = {
  type: 'umbenennen';
  cardId: string;
  cardName: string;
  onClose: () => void;
};

type DialogAnfrage = DialogAnfrageSpeichern | DialogAnfrageUmbenennen;


// ---------- Utils ----------
const cloneNodes = (ns: Node[]) => structuredClone(ns).map(n => ({ ...n, draggable: true }));
const cloneEdges = (es: Edge[]) => structuredClone(es);



// ---------- Store-Signatur ----------
type KartenState = {
  db: Record<string, KartenDefinition>;
  verlauf: Verlauf[];
  geöffnet: Record<string, OffeneKarte>;
  aktiveKarteId: string | null;
  dialogAnfragen: DialogAnfrage[];
  users: User[];
  currentUser: User | null;
  
  // User Management
  registerUser: (name: string, password: string) => Promise<boolean>;
  login: (name: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userId: string, data: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  assignOrphanedCardsToUser: (userId: string, cardIds: string[]) => void;
  deleteOrphanedCards: (cardIds: string[]) => void;
  checkForOrphanedCards: () => boolean;

  // Public
  publishCard: (kartenId: string) => void;
  unpublishCard: (kartenId: string) => void;
  
  // Queries
  findKarte: (id: string) => KartenDefinition | undefined;
  hatZirkulaereAbhaengigkeit: (startKartenId: string, zielKartenId: string) => boolean;

  // Lifecycle
  oeffneKarte: (id: string, name?: string) => void;
  oeffneBibliotheksKarte: (id: string, name?: string) => void;
  erstelleNeueKarte: () => void;
  oeffneUmbenennenDialog: (kartenId: string) => void;
  umbenennenKarte: (kartenId: string, neuerName: string) => void;
  geheZurückZu: (id: string) => void;
  processNextDialog: () => void;
  close: (id?: string) => void;
  save: (id?: string) => void;
  saveAndClose: (id?: string) => void;
  saveAndReload: (id?: string) => void;
  deleteKarte: (kartenId: string) => void;

  // ReactFlow Hooks
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;

  updateNodeData: (nodeId: string, updater: (prevData: any) => any) => void;

  // Karten-Knoten Logik
  addKartenKnoten: (kartenIdToAdd: string, position: XYPosition) => void;

  // Import/Export
  importFromJSON: (json: string) => void;
  exportToJSON: () => string;

  // Schnittstellen mutieren
  addSchnittstelle: (karteId: string, schnittstelle: Schnittstelle) => void;
  removeSchnittstelle: (karteId: string, schnittstelleId: string) => void;
};


// ---------- Store ----------
function indexById(rec: Record<string, KartenDefinition>) {
  const out: Record<string, KartenDefinition> = {};
  for (const k of Object.values(rec)) out[k.id] = k;
  return out;
}

export const useKartenStore = create<KartenState>()(
  persist(
    (set, get) => ({
      // --- STATE ---
      db: indexById(knotenBibliothek),
      verlauf: [],
      geöffnet: {},
      aktiveKarteId: null,
      dialogAnfragen: [],
      users: [],
      currentUser: null,

      // --- User Management ---
      registerUser: async (name, password) => {
        const { users } = get();
        if (users.some(user => user.name === name)) {
          toast.error("Ein Benutzer mit diesem Namen existiert bereits.");
          return false;
        }
        const newUser: User = {
          id: generateUserId(),
          name,
          passwordHash: hashPassword(password),
        };
        set({ users: [...users, newUser], currentUser: newUser });
        toast.success(`Willkommen, ${name}!`);
        return true;
      },

      login: async (name, password) => {
        const { users } = get();
        const user = users.find(user => user.name === name);
        if (!user || user.passwordHash !== hashPassword(password)) {
          toast.error("Ungültiger Benutzername oder Passwort.");
          return false;
        }
        set({ currentUser: user });
        toast.success(`Willkommen zurück, ${name}!`);
        return true;
      },

      logout: () => {
        set({ currentUser: null, verlauf: [], geöffnet: {}, aktiveKarteId: null });
        toast.info("Sie wurden abgemeldet.");
      },

      updateUser: (userId, data) => {
        set(state => ({
          users: state.users.map(user => 
            user.id === userId ? { ...user, ...data } : user
          ),
          currentUser: state.currentUser?.id === userId ? { ...state.currentUser, ...data } : state.currentUser,
        }));
        toast.success("Benutzerdaten aktualisiert.");
      },

      deleteUser: (userId) => {
        const { db, users } = get();
        const newDb = { ...db };
        Object.keys(newDb).forEach(cardId => {
          if (newDb[cardId].userId === userId && newDb[cardId].scope === 'private') {
            const karteToDelete = newDb[cardId];
            (karteToDelete.abhaengigkeiten ?? []).forEach(depId => {
                if(newDb[depId]) {
                    newDb[depId].wirdVerwendetIn = (newDb[depId].wirdVerwendetIn ?? []).filter(id => id !== cardId);
                }
            });
            delete newDb[cardId];
          }
        });

        const newUsers = users.filter(user => user.id !== userId);

        set({ 
            db: newDb, 
            users: newUsers, 
            currentUser: null, 
            aktiveKarteId: null, 
            geöffnet: {}, 
            verlauf: [] 
        });

        toast.warning("Ihr Profil und alle Ihre privaten Karten wurden gelöscht.");
      },

      updateNodeData: (nodeId, updater) => {
        const { aktiveKarteId, geöffnet } = get();
        if (!aktiveKarteId) return;
        const offene = geöffnet[aktiveKarteId];
        if (!offene) return;
      
        const nodes = offene.nodes.map(n =>
          n.id === nodeId ? { ...n, data: updater(n.data) } : n
        );
      
        set({
          geöffnet: {
            ...geöffnet,
            [aktiveKarteId]: { ...offene, nodes, dirty: true },
          },
        });
      },

      assignOrphanedCardsToUser: (userId, cardIds) => {
        const { db } = get();
        const newDb = { ...db };
        cardIds.forEach(cardId => {
            if(newDb[cardId]){
                newDb[cardId].userId = userId;
            }
        });
        set({ db: newDb });
      },

      deleteOrphanedCards: (cardIds) => {
        const { db } = get();
        const newDb = { ...db };
        cardIds.forEach(cardId => {
          if (newDb[cardId] && newDb[cardId].scope === 'private' && !newDb[cardId].userId) {
            delete newDb[cardId];
          }
        });
        set({ db: newDb });
      },

      checkForOrphanedCards: () => {
          const { db } = get();
          return Object.values(db).some(card => card.scope === 'private' && !card.userId);
      },

      // --- Queries ---
      findKarte: (id) => get().db[id],

      hatZirkulaereAbhaengigkeit: (startKartenId, zielKartenId) => {
        const db = get().db;
        const queue = [startKartenId];
        const seen = new Set<string>();
        while (queue.length > 0) {
          const current = queue.shift()!;
          if (current === zielKartenId) return true;
          if (seen.has(current)) continue;
          seen.add(current);
          const karte = db[current];
          if (karte?.wirdVerwendetIn) {
            for (const parentId of karte.wirdVerwendetIn) {
              if (!seen.has(parentId)) queue.push(parentId);
            }
          }
        }
        return false;
      },

      publishCard: (kartenId) => {
        const { db, currentUser, geöffnet } = get();
        const alt = db[kartenId];
        if (!alt) {
          toast.error("Karte nicht gefunden.");
          return;
        }
        if (!currentUser) {
          toast.error("Bitte einloggen, um Karten zu veröffentlichen.");
          return;
        }
        if (alt.scope !== "private") {
          toast.info(`„${alt.name}“ ist bereits öffentlich.`);
          return;
        }
        if (alt.userId !== currentUser.id) {
          toast.error("Nur der Besitzer kann diese Karte veröffentlichen.");
          return;
        }
      
        const neu: KartenDefinition = {
          ...alt,
          scope: "public",
          // userId lassen wir absichtlich stehen, damit klar ist, wer der Autor ist
          updatedAt: Date.now(),
        };
      
        const neueGeöffnet = { ...geöffnet };
        if (neueGeöffnet[kartenId]) {
          // Ab Veröffentlichung schreibgeschützt
          neueGeöffnet[kartenId] = { ...neueGeöffnet[kartenId],/* readonly: true,*/ dirty: false, scope: "public" };
        }
      
        set({ db: { ...db, [kartenId]: neu }, geöffnet: neueGeöffnet });
        toast.success(`„${alt.name}“ wurde veröffentlicht.`);
      },
      
      unpublishCard: (kartenId) => {
        const { db, currentUser, geöffnet } = get();
        const alt = db[kartenId];
        if (!alt) {
          toast.error("Karte nicht gefunden.");
          return;
        }
        if (!currentUser) {
          toast.error("Bitte einloggen, um Karten zu verschieben.");
          return;
        }
        if (alt.scope !== "public") {
          toast.info(`„${alt.name}“ ist bereits privat.`);
          return;
        }
      
        // Beim Zurückziehen setzen wir die Karte auf privat und übertragen Ownership
        const neu: KartenDefinition = {
          ...alt,
          scope: "private",
          userId: currentUser.id,
          updatedAt: Date.now(),
        };
      
        const neueGeöffnet = { ...geöffnet };
        if (neueGeöffnet[kartenId]) {
          // Privatkarten dürfen wieder bearbeitet werden
          neueGeöffnet[kartenId] = { ...neueGeöffnet[kartenId],/* readonly: false,*/ scope: "private" };
        }
      
        set({ db: { ...db, [kartenId]: neu }, geöffnet: neueGeöffnet });
        toast.success(`„${alt.name}“ wurde in private Karten verschoben.`);
      },

      // --- Lifecycle ---
      oeffneKarte: (id: string, name?: string) => {
        const { db, geöffnet, verlauf } = get();
        const karte = db[id];
        if (!karte) return;
        
        console.log(`[KartenStore.oeffneKarte] Öffne private Karte: ${name ?? karte.name} (ID: ${id})`);

        const neueGeöffnete: Record<string, OffeneKarte> = { ...geöffnet };
        if (!neueGeöffnete[id]) {
          const nodes = cloneNodes(karte.nodes ?? []);
          console.log("[KartenStore.oeffneKarte] Geklonte Knoten für private Karte:", nodes);
          neueGeöffnete[id] = {
            nodes: nodes,
            edges: cloneEdges(karte.edges ?? []),
            dirty: false,
            scope: karte.scope,
          };
        }

        let neuerVerlauf = [...verlauf];
        const idx = neuerVerlauf.findIndex(v => v.id === id);
        if (idx !== -1) {
          neuerVerlauf = neuerVerlauf.slice(0, idx + 1);
        } else {
          const kartenname = name ?? karte.name
          neuerVerlauf.push({ id, name: kartenname });
        }

        set({ aktiveKarteId: id, geöffnet: neueGeöffnete, verlauf: neuerVerlauf });
      },
      
      
      oeffneBibliotheksKarte: (id: string, name?: string) => {
        const { geöffnet, verlauf } = get();
        const bibliotheksKarte = findBibliotheksKarte(id);
        if (!bibliotheksKarte) {
          toast.error(`Bibliothekskarte mit ID "${id}" nicht gefunden.`);
          return;
        }

        // console.log(`[KartenStore.oeffneBibliotheksKarte] Öffne Bibliothekskarte: ${bibliotheksKarte.name} (ID: ${bibliotheksKarte.id})`);

        const openId = bibliotheksKarte.id;
        console.log("geöffnet: ",bibliotheksKarte.nodes, bibliotheksKarte.edges)

        const nodes = structuredClone(bibliotheksKarte.nodes ?? []).map(n => ({
          ...n,
          draggable: false,
          selectable: true,
        })); console.log("dupliziert: ",nodes)
        //console.log("[KartenStore.oeffneBibliotheksKarte] Geklonte Knoten für Bibliothekskarte:", nodes);
        const edges = structuredClone(bibliotheksKarte.edges ?? []);

        const neueGeöffnete: Record<string, OffeneKarte> = { ...geöffnet };
        if (!neueGeöffnete[openId]) {
          neueGeöffnete[openId] = {
            nodes,
            edges,
            dirty: false,
            //readonly: true, 
            scope: bibliotheksKarte.scope,
          };
        }

        let neuerVerlauf = [...verlauf];
        const idx = neuerVerlauf.findIndex(v => v.id === openId);
        if (idx !== -1) {
          neuerVerlauf = neuerVerlauf.slice(0, idx + 1);
        } else {
          const kartenname = name ?? bibliotheksKarte.name;
          neuerVerlauf.push({ id: openId, name: kartenname });
        }

        set({
          aktiveKarteId: openId,
          geöffnet: neueGeöffnete,
          verlauf: neuerVerlauf,
        });
      },

      erstelleNeueKarte: () => {
        const { currentUser } = get();
        const id = nanoid();
        const now = Date.now();
        const neueKarte: KartenDefinition = {
          ...structuredClone(vorlageLeer),
          id,
          name: "Unbenannte Karte",
          pfad: "Private/Unbenannte Karte",
          scope: "private",
          userId: currentUser?.id ?? null,
          createdAt: now,
          updatedAt: now,
        };
        set(state => ({ 
          db: { ...state.db, [id]: neueKarte }
        }));
        get().oeffneKarte(id);
      },

      oeffneUmbenennenDialog: (kartenId) => {
        const { db } = get();
        const karte = db[kartenId];
        if (!karte) return;
    
        const anfrage: DialogAnfrageUmbenennen = {
          type: 'umbenennen',
          cardId: kartenId,
          cardName: karte.name,
          onClose: () => get().processNextDialog(),
        };
    
        set(state => ({ dialogAnfragen: [...state.dialogAnfragen, anfrage] }));
      },

      umbenennenKarte: (kartenId, neuerName) => {
        const { db, geöffnet, verlauf } = get();
        const karte = db[kartenId];
    
        if (!karte) {
          toast.error("Karte nicht gefunden.");
          return;
        }
    
        const neuerPfad = karte.pfad.substring(0, karte.pfad.lastIndexOf('/') + 1) + neuerName;
    
        const neuerDb = { ...db };
    
        // 1. Karte selbst aktualisieren
        neuerDb[kartenId] = {
          ...karte,
          name: neuerName,
          pfad: neuerPfad,
          updatedAt: Date.now(),
        };
    
        // 2. Knoten in allen anderen Karten (in der DB) aktualisieren
        for (const id of Object.keys(neuerDb)) {
          if (neuerDb[id].nodes) {
            neuerDb[id].nodes = neuerDb[id].nodes.map(node => {
              if (node.type === KNOTEN.KartenKnoten && node.data.kartenId === kartenId) {
                return { ...node, data: { ...node.data, label: neuerName } };
              }
              return node;
            });
          }
        }
    
        const neueGeöffnet = { ...geöffnet };
    
        // 3. Knoten in allen *geöffneten* Karten aktualisieren
        for (const id of Object.keys(neueGeöffnet)) {
            if (neueGeöffnet[id].nodes) {
                neueGeöffnet[id].nodes = neueGeöffnet[id].nodes.map(node => {
                    if (node.type === KNOTEN.KartenKnoten && node.data.kartenId === kartenId) {
                        return { ...node, data: { ...node.data, label: neuerName } };
                    }
                    return node;
                });
                // Als 'dirty' markieren, falls geändert
                if (id !== kartenId) {
                   neueGeöffnet[id].dirty = true;
                }
            }
        }
    
        // 4. Verlauf aktualisieren
        const neuerVerlauf = verlauf.map(v =>
          v.id === kartenId ? { ...v, name: neuerName } : v
        );
    
        set({
          db: neuerDb,
          geöffnet: neueGeöffnet,
          verlauf: neuerVerlauf,
        });
    
        toast.success(`Karte zu "${neuerName}" umbenannt.`);
      },

      geheZurückZu: (id) => {
        const { verlauf, db, geöffnet } = get();
        if (!db[id] && !geöffnet[id]) return; // auch ephemer erlauben
        const idx = verlauf.findIndex(v => v.id === id);
        if (idx === -1) return;
        const neuerVerlauf = verlauf.slice(0, idx + 1);
      
        // Wenn in db existiert: normale Öffnung, sonst read-only erneuern
        if (db[id]) {
          set({ verlauf: neuerVerlauf });
          get().oeffneKarte(id);
          return;
        }
      
        // Ephemere Bibliothekskarte erneut aktivieren
        set({ verlauf: neuerVerlauf, aktiveKarteId: id });
      },

      processNextDialog: () => {
        set(state => ({ dialogAnfragen: state.dialogAnfragen.slice(1) }));
      },

      close: (id) => {
        const { aktiveKarteId, geöffnet, verlauf } = get();
        const targetId = id ?? aktiveKarteId;
        if (!targetId) return;

        const neueGeöffnet = { ...geöffnet };
        delete neueGeöffnet[targetId];

        const neuerVerlauf = verlauf.filter(v => v.id !== targetId);
        const neueAktive = neuerVerlauf.length > 0 ? neuerVerlauf[neuerVerlauf.length - 1].id : null;

        set({ geöffnet: neueGeöffnet, verlauf: neuerVerlauf, aktiveKarteId: neueAktive });
      },

      save: (id) => {
        const { geöffnet, db, aktiveKarteId } = get();
        const targetId = id ?? aktiveKarteId;
        if (!targetId) return;
        const offene = geöffnet[targetId];
        if (!offene) return;
      
        const alteKarte = db[targetId];
        if (!alteKarte) return;
      
        /*
        if (offene.readonly || alteKarte.scope === "public") {
          toast.info("Öffentliche Karten sind schreibgeschützt.");
          return;
        }
          */
      
        const updated: KartenDefinition = {
          ...alteKarte,
          nodes: cloneNodes(offene.nodes),
          edges: cloneEdges(offene.edges),
          updatedAt: Date.now(),
        };
        set({
          db: { ...db, [targetId]: updated },
          geöffnet: { ...geöffnet, [targetId]: { ...offene, dirty: false } },
        });
      },

      saveAndClose: (id) => {
        get().save(id);
        get().close(id);
      },

      saveAndReload: (id) => {
        get().save(id);
        const useId = id ?? get().aktiveKarteId;
        if (!useId) return;
        get().oeffneKarte(useId);
      },

      deleteKarte: (kartenId) => {
        const { db } = get();
        const karteToDelete = db[kartenId];
        if (!karteToDelete) return;

        if ((karteToDelete.wirdVerwendetIn ?? []).length > 0) {
          toast.error(`Die Karte "${karteToDelete.name}" wird in anderen Karten verwendet und kann nicht gelöscht werden.`);
          return;
        }

        const newDb = { ...db };
        for (const [id, card] of Object.entries(newDb)) {
          if (id === kartenId) continue;
          newDb[id] = {
            ...card,
            abhaengigkeiten: (card.abhaengigkeiten ?? []).filter(dep => dep !== kartenId),
            wirdVerwendetIn: (card.wirdVerwendetIn ?? []).filter(dep => dep !== kartenId),
          };
        }

        for (const depId of karteToDelete.abhaengigkeiten ?? []) {
          const depCard = newDb[depId];
          if (depCard) {
            newDb[depId] = {
              ...depCard,
              wirdVerwendetIn: (depCard.wirdVerwendetIn ?? []).filter(id => id !== kartenId),
            };
          }
        }

        delete newDb[kartenId];
        get().close(kartenId);
        set({ db: newDb });
        toast.success(`Die Karte "${karteToDelete.name}" wurde gelöscht.`);
      },

      // Für die Karte
      onNodesChange: (changes) => {
        const { aktiveKarteId, geöffnet } = get();
        if (!aktiveKarteId) return;
        const offene = geöffnet[aktiveKarteId];
        if (!offene /*|| offene.readonly*/) return; // block
        const nodes = applyNodeChanges(changes, offene.nodes);
        set({ geöffnet: { ...geöffnet, [aktiveKarteId]: { ...offene, nodes, dirty: true } } });
      },
      
      onEdgesChange: (changes) => {
        const { aktiveKarteId, geöffnet } = get();
        if (!aktiveKarteId) return;
        const offene = geöffnet[aktiveKarteId];
        if (!offene /*|| offene.readonly*/) return; // block
        const edges = applyEdgeChanges(changes, offene.edges);
        set({ geöffnet: { ...geöffnet, [aktiveKarteId]: { ...offene, edges, dirty: true } } });
      },
      
      onConnect: (connection) => {
        const { aktiveKarteId, geöffnet } = get();
        if (!aktiveKarteId) return;
        const offene = geöffnet[aktiveKarteId];
        if (!offene /*|| offene.readonly*/) return; // block
        const edgeId = `e-${nanoid()}`;
        const edges = addEdge({ ...connection, id: edgeId }, offene.edges);
        set({ geöffnet: { ...geöffnet, [aktiveKarteId]: { ...offene, edges, dirty: true } } });
      },

      // --- Karten-Knoten Logik ---
      addKartenKnoten: (kartenIdToAdd, position) => {
        const { aktiveKarteId, db, geöffnet, hatZirkulaereAbhaengigkeit } = get();
        if (!aktiveKarteId) return;

        if (hatZirkulaereAbhaengigkeit(aktiveKarteId, kartenIdToAdd)) {
          toast.error("Zirkuläre Abhängigkeit entdeckt! Die Karte kann nicht hinzugefügt werden.");
          return;
        }

        const aktiveKarte = geöffnet[aktiveKarteId];
        const karteToAdd = db[kartenIdToAdd];
        if (!aktiveKarte || !karteToAdd) return;

        const neuerKnoten: Node = {
          id: `kartenknoten-${nanoid()}`,
          type: KNOTEN.KartenKnoten,
          position,
          data: { kartenId: kartenIdToAdd, label: karteToAdd.name },
        };

        const updatedNodes = [...aktiveKarte.nodes, neuerKnoten];

        const newDb = { ...db };
        newDb[aktiveKarteId] = {
          ...(newDb[aktiveKarteId]),
          abhaengigkeiten: [
            ...new Set([...(newDb[aktiveKarteId].abhaengigkeiten ?? []), kartenIdToAdd]),
          ],
        };
        newDb[kartenIdToAdd] = {
          ...(newDb[kartenIdToAdd]),
          wirdVerwendetIn: [
            ...new Set([...(newDb[kartenIdToAdd].wirdVerwendetIn ?? []), aktiveKarteId]),
          ],
        };

        set({
          geöffnet: {
            ...geöffnet,
            [aktiveKarteId]: { ...aktiveKarte, nodes: updatedNodes, dirty: true },
          },
          db: newDb,
        });
      },

      // --- Import/Export ---
      importFromJSON: (json) => {
        try {
          const parsed = JSON.parse(json) as Record<string, KartenDefinition>;
          set({ db: parsed, aktiveKarteId: null, geöffnet: {}, verlauf: [], dialogAnfragen: [] });
          toast.success("Import erfolgreich.");
        } catch {
          toast.error("Import fehlgeschlagen: ungültiges JSON.");
        }
      },

      exportToJSON: () => {
        const data = get().db;
        return JSON.stringify(data, null, 2);
      },

      // --- Schnittstellen Mutationen ---
      addSchnittstelle: (karteId, schnittstelle) => {
        const { db } = get();
        const alt = db[karteId];
        if (!alt) return;
        const neu: KartenDefinition = {
          ...alt,
          schnittstellen: [...(alt.schnittstellen ?? []), schnittstelle],
          updatedAt: Date.now(),
        };
        set({ db: { ...db, [karteId]: neu } });
      },

      removeSchnittstelle: (karteId, schnittstelleId) => {
        const { db } = get();
        const alt = db[karteId];
        if (!alt) return;
        const neu: KartenDefinition = {
          ...alt,
          schnittstellen: (alt.schnittstellen ?? []).filter(s => s.id !== schnittstelleId),
          updatedAt: Date.now(),
        };
        set({ db: { ...db, [karteId]: neu } });
      },
    }),
    { name: "karten-db" }
  )
);
