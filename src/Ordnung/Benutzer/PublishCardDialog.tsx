// ./src/Ordnung/Benutzer/PublishCardDialog.tsx

import { useMemo } from "react";
import { useKartenStore } from "@/Ordnung/DatenBank/KartenStore";
import { ListenDialog } from "@/Ordnung/Dialoge/ListenDialog";

export function PublishCardDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { db, currentUser, publishCard } = useKartenStore(state => ({
    db: state.db,
    currentUser: state.currentUser,
    publishCard: state.publishCard,
  }));

  const privateKarten = useMemo(
    () =>
      currentUser
        ? Object.values(db).filter(k => k.scope === "private" && k.userId === currentUser.id)
        : [],
    [db, currentUser]
  );

  return (
    <ListenDialog
      open={open}
      onClose={onClose}
      title="Karte veröffentlichen"
      description="Wähle eine private Karte zum Veröffentlichen"
      items={privateKarten}
      mode="pick"
      onPick={(id) => {
        publishCard(id);
        onClose();
      }}
    />
  );
}