// ./src/Ordnung/DatenBank/KartenStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  reconnectEdge,
  type Connection,
  type Edge,
  type OnEdgesChange,
  type OnNodesChange,
  type Node,
  type XYPosition,
} from "@xyflow/react";
import { nanoid } from "nanoid";
import { toast } from "sonner";

import { KNOTEN, type KartenDefinition } from "@/Atlas/Karten.types.ts";
import { KartenKnotenDaten } from "@/Atlas/Knoten.types";
import knotenBibliothek, { vorlageLeer } from "@/Atlas/Karten/Vorlagen/KartenVorlage";
import { type User } from "@/Ordnung/programm.types.ts";
import { hashPassword, generateUserId } from "@/Ordnung/Benutzer/utils";
import { _anschlüsse } from "@/Atlas/Karten/Vorlagen/methoden";
import {
  cloneNodes, cloneEdges, indexById, findBibliotheksKarte, reconnectWithSingleTarget, addEdgeWithSingleTarget,
  collectDirtyIds, closeAllExceptIds, forceOpen, promptMultiSaveOrDiscard,
  decorateNodesForScope,
  setVerlaufDirty, _findeHandle,
} from "@/Ordnung/DatenBank/methoden.ts"
import { KartenState, OffeneKarte, DialogAnfrageUmbenennen } from "../datenbank.types";
import { Fluß } from "@/Atlas/Anschlüsse.types";


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
          const nodes = cloneNodes(karte.nodes ?? []).map(n => ({
            ...n,
            deletable: karte.scope === "private",
            draggable: karte.scope !== "defined",
            selectable: karte.scope !== "defined",
          }));
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
          neuerVerlauf.push({ id, name: kartenname, dirty: false });
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
        //console.log("geöffnet: ",bibliotheksKarte.nodes, bibliotheksKarte.edges)

        //console.log("[KartenStore.oeffneBibliotheksKarte] Geklonte Knoten für Bibliothekskarte:", nodes);
        const nodes = decorateNodesForScope(structuredClone(bibliotheksKarte.nodes ?? []),bibliotheksKarte.scope)
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
          neuerVerlauf.push({ id: openId, name: kartenname, dirty: false });
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

      geheZurückZu: (id: string) => {
        const { verlauf, geöffnet, db } = get();
        const idx = verlauf.findIndex(v => v.id === id);
        if (idx === -1) return;

        const keepIds = verlauf.slice(0, idx + 1).map(v => v.id);
        const dropIds = verlauf.slice(idx + 1).map(v => v.id);
        const dirty = collectDirtyIds(db, geöffnet);
        const dirtyToClose = dirty.filter(d => dropIds.includes(d));

        const proceed = () => {
          closeAllExceptIds(get,set,keepIds);
          // aktive Karte setzen auf id
          forceOpen(get,set,id);
        };

        if (dirtyToClose.length > 0) {
          promptMultiSaveOrDiscard(get,set,dirtyToClose, proceed);
        } else {
          proceed();
        }
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
        setVerlaufDirty(get, set, targetId, false)
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
        setVerlaufDirty(get, set, aktiveKarteId, true)
        set({ geöffnet: { ...geöffnet, [aktiveKarteId]: { ...offene, nodes, dirty: true } } });
      },
      
      onEdgesChange: (changes) => {
        const { aktiveKarteId, geöffnet } = get();
        if (!aktiveKarteId) return;
        const offene = geöffnet[aktiveKarteId];
        if (!offene /*|| offene.readonly*/) return; // block

        const edges = applyEdgeChanges(changes, offene.edges);
        setVerlaufDirty(get, set, aktiveKarteId, true)
        set({ geöffnet: { ...geöffnet, [aktiveKarteId]: { ...offene, edges, dirty: true } } });
      },
      
      onConnect: (connection) => {
        const { aktiveKarteId, geöffnet } = get();
        if (!aktiveKarteId) return;
        const offene = geöffnet[aktiveKarteId];
        if (!offene) return;

        const nextEdges = addEdgeWithSingleTarget(connection, offene.edges);
        setVerlaufDirty(get, set, aktiveKarteId, true)
        set({ geöffnet: { ...geöffnet, [aktiveKarteId]: { ...offene, edges: nextEdges, dirty: true } } });
      },

      onReconnect: (oldEdge, connection) => {
        const { aktiveKarteId, geöffnet } = get();
        if (!aktiveKarteId) return;
        const offene = geöffnet[aktiveKarteId];
        if (!offene) return;

        const nextEdges = reconnectWithSingleTarget(oldEdge, connection, offene.edges);
        setVerlaufDirty(get, set, aktiveKarteId, true)
        set({ geöffnet: { ...geöffnet, [aktiveKarteId]: { ...offene, edges: nextEdges, dirty: true } } });
      },




      // --- Knoten Logik ---
      addKnoten: (knoten: KNOTEN, position: XYPosition, data: any) => {
        const { aktiveKarteId, geöffnet } = get();
        if (!aktiveKarteId) {
          console.warn("[addKnoten] Abbruch: keine aktive Karte.");
          toast.error("Keine aktive Karte geöffnet.");
          return;
        }

        const offene = geöffnet[aktiveKarteId];
        if (offene.scope === "defined") return; // keine Änderungen erlaubt
        if (!offene /*|| offene.readonly*/) {
          console.warn("[addKnoten] Abbruch: aktive Karte nicht geöffnet oder schreibgeschützt.");
          return;
        }

        // Position validieren und ggf. fallbacken
        const p = position ?? ({ x: 0, y: 0 } as XYPosition);
        const posOk =
          Number.isFinite(p.x) &&
          Number.isFinite(p.y) &&
          Math.abs(p.x) < 1e7 &&
          Math.abs(p.y) < 1e7;
        const safePos = posOk ? p : ({ x: 0, y: 0 } as XYPosition);
        if (!posOk) {
          console.warn("[addKnoten] Ungültige Position, nutze {0,0}. Eingabe:", position);
        }

        // Anschlüsse-Defaults aus Bibliothek (falls vorhanden) einmischen,
        // ohne vom Aufrufer bereits gesetzte Felder zu überschreiben.
        // const defaultAnschluesse = _anschlüsse?.[knoten];
        const mergedData = {
        //  ...(defaultAnschluesse ? { anschlüsse: defaultAnschluesse } : {}),
          ...(data ?? {}),
        };

        const neuerKnoten: Node = {
          id: `${knoten}-${nanoid()}`,
          type: knoten,               // vordefinierter Knotentyp
          position: safePos,
          data: mergedData,
          draggable: true,
          selectable: true,
        };

        const updatedNodes = [...(offene.nodes ?? []), neuerKnoten];

        setVerlaufDirty(get, set, aktiveKarteId, true)
        set({
          geöffnet: {
            ...geöffnet,
            [aktiveKarteId]: { ...offene, nodes: updatedNodes, dirty: true },
          },
        });

        // kleines Trace-Log für die Nachwelt
        const after = get().geöffnet[aktiveKarteId];
        console.log(
          "[addKnoten] hinzugefügt:",
          neuerKnoten.id,
          "Typ:",
          knoten,
          "Nodes gesamt:",
          after?.nodes?.length ?? 0
        );
      },


      // --- Karten-Knoten Logik ---
      addKartenKnoten: (kartenIdToAdd, position) => {
        // kompakte Trace-ID pro Aufruf
        const trace = `addKartenKnoten:${kartenIdToAdd}:${Date.now().toString(36)}`;
        console.groupCollapsed(`[${trace}] ▶ start`);

        try {
          const { aktiveKarteId, db, geöffnet, hatZirkulaereAbhaengigkeit } = get();

          console.log("aktiveKarteId:", aktiveKarteId);
          console.log("arg kartenIdToAdd:", kartenIdToAdd);
          console.log("arg position (expected FLOW coords):", position);

          if (!aktiveKarteId) {
            console.warn("Abbruch: keine aktive Karte (aktiveKarteId=null).");
            return;
          }

          // Sanity-Check Position
          const p = position ?? { x: NaN, y: NaN } as XYPosition;
          const posOk =
            Number.isFinite(p.x) &&
            Number.isFinite(p.y) &&
            Math.abs(p.x) < 1e7 &&
            Math.abs(p.y) < 1e7;
          if (!posOk) {
            console.warn("Warnung: ungültige Position, setze Fallback {x:0,y:0}. Eingabe war:", p);
            position = { x: 0, y: 0 };
          }

          // Zirkularitäts-Check
          const circ = hatZirkulaereAbhaengigkeit(aktiveKarteId, kartenIdToAdd);
          console.log("zirkuläre Abhängigkeit?", circ);
          if (circ) {
            toast.error("Zirkuläre Abhängigkeit entdeckt! Die Karte kann nicht hinzugefügt werden.");
            return;
          }

          const aktiveKarte = geöffnet[aktiveKarteId];
          if (!aktiveKarte) {
            console.warn("Abbruch: aktive Karte nicht in 'geöffnet' gefunden.");
            return;
          }

          const karteToAdd = db[kartenIdToAdd];
          console.log("karteToAdd vorhanden?", Boolean(karteToAdd));
          if (!karteToAdd) {
            console.warn("Abbruch: Zielkarte nicht in DB:", kartenIdToAdd, "DB keys:", Object.keys(db));
            return;
          }

          console.log("nodes (vorher):", aktiveKarte.nodes?.length ?? 0);

          const data = { aktiveKarteId, karte: {definition: karteToAdd}, title: karteToAdd.name, badge: "Karte" } as KartenKnotenDaten
          const neuerKnoten: Node = {
            id: `kartenknoten-${nanoid()}`,
            type: KNOTEN.KartenKnoten,
            position, data,
          };

          const updatedNodes = [...(aktiveKarte.nodes ?? []), neuerKnoten];
          console.log("neu erzeugter Node:", neuerKnoten);
          console.log("nodes (nachher, lokal):", updatedNodes.length);

          // Dependency-Graph pflegen
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

          // Zustand setzen
          setVerlaufDirty(get, set, aktiveKarteId, true)
          set({
            geöffnet: {
              ...geöffnet,
              [aktiveKarteId]: { ...aktiveKarte, nodes: updatedNodes, dirty: true },
            },
            db: newDb,
          });

          // Direkt nach set() erneut lesen (Zustand ist bei Zustand sync)
          const after = get().geöffnet[aktiveKarteId];
          console.log("nodes (nach set):", after?.nodes?.length ?? 0);
          console.log("dirty (nach set):", after?.dirty);

          if (!after || (after.nodes?.length ?? 0) !== updatedNodes.length) {
            console.warn(
              "Ungewöhnlich: Zustand nach set() spiegelt die Node-Änderung nicht wider. " +
              "Prüfe Persist/Selector und ob die UI korrekt aus 'geöffnet[aktiveKarteId]' liest."
            );
          } else {
            console.log("✔ Node im Store aktualisiert. UI sollte re-rendern.");
          }
        } catch (err) {
          console.error(`[${trace}] Fehler in addKartenKnoten:`, err);
        } finally {
          console.groupEnd();
        }
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
        setVerlaufDirty(get, set, karteId, true)
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
        setVerlaufDirty(get, set, karteId, true)
        set({ db: { ...db, [karteId]: neu } });
      },

      selection: { nodeIds: [], edgeIds: [] },

      setSelectionSnapshot: (s) => set({ selection: { nodeIds: [...s.nodeIds], edgeIds: [...s.edgeIds] } }),
      clearSelectionSnapshot: () => set({ selection: { nodeIds: [], edgeIds: [] } }),

      openFromAtlas: (targetId: string, name?: string) => {
        const { db, geöffnet } = get();
        if (!db[targetId] && !geöffnet[targetId]) return;

        const dirty = collectDirtyIds(db, geöffnet);
        const willClose = Object.keys(geöffnet).filter(id => id !== targetId && geöffnet[id]);
        const dirtyToClose = dirty.filter(id => willClose.includes(id));

        const proceed = () => {
          // wirklich alles schließen außer target
          closeAllExceptIds(get,set,[targetId]);
          // target öffnen und Pfad auf nur target setzen
          forceOpen(get,set,targetId, name);
          set({ verlauf: [{ id: targetId, name: name ?? db[targetId]?.name ?? "Unbenannt", dirty: false }] });
        };

        if (dirtyToClose.length > 0) {
          promptMultiSaveOrDiscard(get,set,dirtyToClose, proceed);
        } else {
          proceed();
        }
      },

      // NEU: Öffnen via Kartenknoten-Badge (hängt an, Pfad erweitert)
      openFromKartenKnoten: (parentId: string, childId: string) => {
        const { db, geöffnet, verlauf } = get();
        if (!db[childId] && !geöffnet[childId]) return;

        // nichts schließen, nur anhängen/aktivieren
        forceOpen(get,set,childId);

        // Pfad erweitern, aber Duplikate vermeiden
        const idx = verlauf.findIndex(v => v.id === childId);
        const name = db[childId]?.name ?? verlauf[idx]?.name ?? "Unbenannt";
        const neuerVerlauf = idx === -1 ? [...verlauf, { id: childId, name, dirty: false }] : verlauf.slice(0, idx + 1);

        setVerlaufDirty(get, set, childId, true)
        set({ verlauf: neuerVerlauf, aktiveKarteId: childId });
      },


      deleteSelected: () => {
        const { aktiveKarteId, geöffnet, selection } = get();
        if (!aktiveKarteId) return;
        const offene = geöffnet[aktiveKarteId];
        if (!offene || offene.scope === "defined") return;

        const nodes = offene.nodes.filter(n => !selection.nodeIds.includes(n.id));
        const edges = offene.edges.filter(e => !selection.edgeIds.includes(e.id));
        
        setVerlaufDirty(get, set, aktiveKarteId, true)
        set({ geöffnet: { ...geöffnet, [aktiveKarteId]: { ...offene, nodes, edges, dirty: true } } });
        get().clearSelectionSnapshot();
      },

      duplicateSelected: () => {
        const { aktiveKarteId, geöffnet, selection } = get();
        if (!aktiveKarteId) return;
        const offene = geöffnet[aktiveKarteId];
        if (!offene || offene.scope === "defined") return;

        const map = new Map(offene.nodes.map(n => [n.id, n] as const));
        const selected = selection.nodeIds.map(id => map.get(id)).filter(Boolean) as typeof offene.nodes;

        const clones = selected.map(orig => ({
          ...structuredClone(orig),
          id: `${orig.id}-copy-${nanoid(4)}`,
          position: { x: orig.position.x + 24, y: orig.position.y + 24 },
          selected: false,
        }));

        const nodes = [...offene.nodes, ...clones];
        setVerlaufDirty(get, set, aktiveKarteId, true)
        set({ geöffnet: { ...geöffnet, [aktiveKarteId]: { ...offene, nodes, dirty: true } } });
        // Auswahl der Duplikate optional setzen? Wir lassen ReactFlow regeln.
      },

      groupSelected: () => {
        // Platzhalter: kein GroupNode, aber Hook für spätere Meta-Operationen.
        toast.info("Gruppieren ist vorbereitet, aber noch ohne Group-Node-Modell.");
      },

      copySelectionToNewCard: () => {
        const { selection } = get();
        if (selection.nodeIds.length === 0) return toast.info("Nichts ausgewählt zum Kopieren.");
        toast.info("Kopieren in neue Karte: TODO-Implementierung.");
      },

      moveSelectionToNewCard: () => {
        const { selection } = get();
        if (selection.nodeIds.length === 0) return toast.info("Nichts ausgewählt zum Verschieben.");
        toast.info("Verschieben in neue Karte: TODO-Implementierung.");
      },

      // --- Variablen Mutationen (NEU) ---
      addVariable: (karteId, variable) => {
        const { db } = get();
        const alt = db[karteId];
        if (!alt) return;

        // Name-Eindeutigkeit pro Karte sichern
        const dup = (alt.variablen ?? []).some(v => v.name.trim() === variable.name.trim());
        if (dup) { toast.error(`Variable „${variable.name}“ existiert bereits.`); return; }

        const neu: KartenDefinition = {
          ...alt,
          variablen: [...(alt.variablen ?? []), variable],
          updatedAt: Date.now(),
        };
        setVerlaufDirty(get, set, karteId, true);
        set({ db: { ...db, [karteId]: neu } });
      },

      removeVariable: (karteId, variableId) => {
        const { db } = get();
        const alt = db[karteId];
        if (!alt) return;
        const neu: KartenDefinition = {
          ...alt,
          variablen: (alt.variablen ?? []).filter(v => v.id !== variableId),
          updatedAt: Date.now(),
        };
        setVerlaufDirty(get, set, karteId, true);
        set({ db: { ...db, [karteId]: neu } });
      },

      deleteNodeById: (nodeId: string) => {
        const { aktiveKarteId, geöffnet, db, selection } = get();
        if (!aktiveKarteId) return;
        const offene = geöffnet[aktiveKarteId];
        if (!offene || offene.scope === "defined") return;

        const node = offene.nodes.find(n => n.id === nodeId);
        if (!node) {
          toast.info("Knoten nicht gefunden.");
          return;
        }

        // Knoten und alle angrenzenden Kanten entfernen
        const nodes = offene.nodes.filter(n => n.id !== nodeId);
        const edges = offene.edges.filter(e => e.source !== nodeId && e.target !== nodeId);

        // Dependency-Graph pflegen, falls es ein KartenKnoten ist
        try {
          if (node.type === KNOTEN.KartenKnoten) {
            const data = node.data as KartenKnotenDaten
            // tolerant gegenüber alten/verschiedenen Datenformen
            const targetId: string | undefined = data.karte.definition?.id;

            if (targetId) {
              // Prüfen, ob noch weitere KartenKnoten auf dieselbe Zielkarte zeigen
              const weitereReferenzen = nodes.some(
                n =>
                  n.type === KNOTEN.KartenKnoten && (n.data as KartenKnotenDaten).karte.definition.id === targetId
              );

              if (!weitereReferenzen) {
                const newDb = { ...db };
                // aus abhaengigkeiten der aktiven Karte entfernen
                if (newDb[aktiveKarteId]) {
                  newDb[aktiveKarteId] = {
                    ...newDb[aktiveKarteId],
                    abhaengigkeiten: (newDb[aktiveKarteId].abhaengigkeiten ?? []).filter(id => id !== targetId),
                  };
                }
                // aus wirdVerwendetIn der Zielkarte entfernen
                if (newDb[targetId]) {
                  newDb[targetId] = {
                    ...newDb[targetId],
                    wirdVerwendetIn: (newDb[targetId].wirdVerwendetIn ?? []).filter(id => id !== aktiveKarteId),
                  };
                }
                set({ db: newDb });
              }
            }
          }
        } catch (e) {
          console.warn("[deleteNodeById] Dependency-Cleanup übersprungen:", e);
        }

        // Auswahl aufräumen (falls der gelöschte Node/Kanten selektiert waren)
        const neueSelection = {
          nodeIds: (selection?.nodeIds ?? []).filter(id => id !== nodeId),
          edgeIds: (selection?.edgeIds ?? []).filter(
            eid => edges.some(e => e.id === eid)
          ),
        };

        setVerlaufDirty(get, set, aktiveKarteId, true);
        set({
          geöffnet: {
            ...geöffnet,
            [aktiveKarteId]: { ...offene, nodes, edges, dirty: true },
          },
          selection: neueSelection,
        });

        toast.success("Knoten gelöscht.");
      },


      revalidateEdgesForNode: (nodeId: string) => {
        const { aktiveKarteId, geöffnet } = get();
        if (!aktiveKarteId) return;
        const offene = geöffnet[aktiveKarteId];
        if (!offene) return;

        const nodeMap = new Map(offene.nodes.map(n => [n.id, n]));
        const neueEdges: Edge[] = [];

        for (const e of offene.edges) {
          const src = nodeMap.get(e.source);
          const tgt = nodeMap.get(e.target);
          if (!src || !tgt) continue;

          const sh = _findeHandle(src, e.sourceHandle ?? null, Fluß.Ausgang);
          const th = _findeHandle(tgt, e.targetHandle ?? null, Fluß.Eingang);

          // Wenn die Kante diesen Node berührt, streng prüfen.
          if (e.source === nodeId || e.target === nodeId) {
            if (!sh || !th || sh.dtype !== th.dtype) {
              // inkompatibel -> weg
              continue;
            }
          }

          // sonst unverändert behalten
          neueEdges.push(e);
        }

        if (neueEdges.length !== offene.edges.length) {
          set({
            geöffnet: {
              ...geöffnet,
              [aktiveKarteId]: { ...offene, edges: neueEdges, dirty: true },
            },
          });
          toast.info("Inkompatible Verbindungen wurden entfernt.");
        }
      },


    }),
    { name: "karten-db" }
  )
);

