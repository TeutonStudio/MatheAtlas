import React from 'react';
import { useKartenStore } from "@/Ordnung/DatenBank/KartenStore.ts";
import { SpeicherDialog } from "@/Ordnung/Dialoge/SpeicherDialog";
//import { UmbenennenDialog } from "@/Ordnung/KontextMenü/UmbenennenDialog.tsx";

function DialogManager() {
  const anfragen = useKartenStore(s => s.dialogAnfragen);
  const aktuelleAnfrage = anfragen.length > 0 ? anfragen[0] : null;

  if (!aktuelleAnfrage) {
    return null;
  }

  switch (aktuelleAnfrage.type) {
    case 'speichern':
      return (
        <SpeicherDialog
          open={true}
          kartenName={aktuelleAnfrage.cardName}
          onSave={aktuelleAnfrage.onSave}
          onDiscard={aktuelleAnfrage.onDiscard}
          onClose={aktuelleAnfrage.onCancel}
        />
      );
    case 'umbenennen':
      return null;
    default:
      return null;
  }
}
