/// ./src/Ordnung/Benutzer/PrivateKartenDialog.tsx

import { useMemo } from "react";
import { useKartenStore } from "@/Ordnung/DatenBank/KartenStore";
import { ListenDialog } from "@/Ordnung/Dialoge/ListenDialog";
import { type ListenAktion, type ListenDialogArgumente } from "../dialoge.types";

export function PrivateKartenDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { db, umbenennenKarte, deleteKarte, currentUser } = useKartenStore(state => ({
    db: state.db,
    umbenennenKarte: state.umbenennenKarte,
    deleteKarte: state.deleteKarte,
    currentUser: state.currentUser,
  }));

  const privateKarten = useMemo(
    () =>
      currentUser
        ? Object.values(db).filter(k => k.scope === "private" && k.userId === currentUser.id)
        : [],
    [db, currentUser]
  );

  const isCardDependency = (cardId: string) => {
    const card = db[cardId];
    return !!(card && (card.wirdVerwendetIn ?? []).length > 0);
  };

  const aktionen: ListenAktion[] = []; // optional

  return (
    <ListenDialog
      open={open}
      onClose={onClose}
      title="Private Karten verwalten"
      description="Liste privater Karten"
      items={privateKarten}
      aktionen={aktionen}
      mode="manage"
      onRename={(id, newName) => umbenennenKarte(id, newName)}
      onDelete={(id) => deleteKarte(id)}
      isDeleteDisabled={isCardDependency}
      buildConfirmDialogContent={({ name }) => ({
        title: "Karte löschen?",
        description: `Möchtest du „${name}“ wirklich löschen? \n Diese Aktion kann nicht rückgängig gemacht werden.`,
        confirmLabel: "Löschen",
        confirmVariant: "destructive",
        cancelLabel: "Abbrechen",
      })}
    />
  );
}