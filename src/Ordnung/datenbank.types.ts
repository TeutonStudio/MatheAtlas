/// ./src/Ordnung/datenbank.types.ts


import {
  type Connection,
  type Edge,
  type OnEdgesChange,
  type OnNodesChange,
  type Node,
  type XYPosition,
} from "@xyflow/react";

import { KNOTEN, Lebensraum, Variable, type KartenDefinition, type Schnittstelle } from "@/Atlas/Karten.types.ts";
import { type User } from "@/Ordnung/programm.types.ts";
//import { _anschlüsse } from "@/Atlas/Karten/Vorlagen/methoden";

// ---------- Types ----------
export type OffeneKarte = {
  nodes: Node[];
  edges: Edge[];
  dirty: boolean;
  //readonly?: boolean; // neu
  scope: Lebensraum;
};

export type SelectionSnapshot = {
  nodeIds: string[];
  edgeIds: string[];
};

export type Verlauf = { id: string; name: string; dirty: boolean };

export type DialogAnfrageSpeichern = {
  type: 'speichern';
  cardId: string;
  cardName: string;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
};

export type DialogAnfrageUmbenennen = {
  type: 'umbenennen';
  cardId: string;
  cardName: string;
  onClose: () => void;
};

//export type DialogAnfrage = DialogAnfrageSpeichern | DialogAnfrageUmbenennen;


export type DialogAnfrageMultiSpeichern = {
    type: 'multi-speichern';
    cardIds: string[];
    cards: { id: string; name: string }[];
    onSaveAll: () => void;
    onDiscardAll: () => void;
    onCancel: () => void;
};

export type DialogAnfrage = DialogAnfrageSpeichern | DialogAnfrageUmbenennen | DialogAnfrageMultiSpeichern;



// ---------- Store-Signatur ----------
export type KartenState = {
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
  onReconnect: (oldEdge: Edge, connection: Connection) => void;

  updateNodeData: (nodeId: string, updater: (prevData: any) => any) => void;

  // Karten-Knoten Logik
  addKnoten: (knoten: KNOTEN, position: XYPosition, data: any) => void;
  addKartenKnoten: (kartenIdToAdd: string, position: XYPosition) => void;

  // Import/Export
  importFromJSON: (json: string) => void;
  exportToJSON: () => string;

  // Schnittstellen mutieren
  addSchnittstelle: (karteId: string, schnittstelle: Schnittstelle) => void;
  removeSchnittstelle: (karteId: string, schnittstelleId: string) => void;


  openFromAtlas: (id: string, name?: string) => void;            // NEU
  openFromKartenKnoten: (parentId: string, childId: string) => void; // NEU

  selection: SelectionSnapshot;     
  setSelectionSnapshot: (s: SelectionSnapshot) => void; 
  clearSelectionSnapshot: () => void; 
  deleteSelected: () => void;        // Löschen
  duplicateSelected: () => void;     // Duplizieren
  groupSelected: () => void;         // “Gruppieren” (vorerst Platzhalter)
  copySelectionToNewCard: () => void; // Zu neuer Karte kopieren
  moveSelectionToNewCard: () => void; // Zu neuer Karte verschieben

  addVariable: (karteId: string, variable: Variable) => void;
  removeVariable: (karteId: string, variableId: string) => void;

  deleteNodeById: (nodeId: string) => void;
  revalidateEdgesForNode: (nodeId: string) => void;

  graphVersion: Record<string, number>;
  nodeDataVersions: Record<string, Record<string, number>>;
};
