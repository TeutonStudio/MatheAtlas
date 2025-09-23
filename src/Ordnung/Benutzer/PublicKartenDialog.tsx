// ./src/Ordnung/Benutzer/PublicKartenDialog.tsx

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { UploadIcon, DownloadIcon } from "@radix-ui/react-icons";
import { useKartenStore } from "@/Ordnung/DatenBank/KartenStore";
import { ListenDialog } from "@/Ordnung/Dialoge/ListenDialog";
import { type ListenAktion, type ListenDialogArgumente } from "../dialoge.types";
import { PublishCardDialog } from "./PublishCardDialog";

export function PublicKartenDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { db, umbenennenKarte, unpublishCard } = useKartenStore(state => ({
    db: state.db,
    umbenennenKarte: state.umbenennenKarte,
    unpublishCard: state.unpublishCard,
  }));

  const publicKarten = useMemo(
    () => Object.values(db).filter(k => k.scope === "public"),
    [db]
  );

  const [publishDialogOpen, setPublishDialogOpen] = useState(false);

  const aktionen: ListenAktion[] = [
    // hier könntest du Menüpunkte ergänzen
  ];

  const headerActions = (
    <>
      <Button variant="outline" onClick={() => setPublishDialogOpen(true)}>
        <UploadIcon className="mr-2 h-4 w-4" />
        Karte veröffentlichen
      </Button>
      <Button variant="outline" disabled>
        <DownloadIcon className="mr-2 h-4 w-4" />
        Karte herunterladen
      </Button>
    </>
  );

  return (
    <>
      <ListenDialog
        open={open}
        onClose={onClose}
        title="Öffentliche Karten verwalten"
        description="Liste öffentlicher Karten"
        items={publicKarten}
        aktionen={aktionen}
        headerActions={headerActions}
        mode="manage"
        onRename={(id, newName) => umbenennenKarte(id, newName)}
        onDelete={(id) => unpublishCard(id)} // zurück in private
        isDeleteDisabled={() => false}
        buildConfirmDialogContent={({ name }) => ({
          title: "Karte entpublizieren?",
          description: `„${name}“ wird zurück in den privaten Speicher verschoben.`,
          confirmLabel: "Entpublizieren",
          cancelLabel: "Abbrechen",
        })}
      />
      <PublishCardDialog open={publishDialogOpen} onClose={() => setPublishDialogOpen(false)} />
    </>
  );
}