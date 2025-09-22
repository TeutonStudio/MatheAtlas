/// ./src/Ordnung/Dialoge/MultiSpeicherDialog.tsx

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function MultiSpeicherDialog({
  open,
  onOpenChange,
  cards,
  onSaveAll,
  onDiscardAll,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  cards: { id: string; name: string }[];
  onSaveAll: () => void;
  onDiscardAll: () => void;
}) {
  const list = cards.map(c => `• ${c.name}`).join("\n");
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Ungespeicherte Änderungen</AlertDialogTitle>
          <AlertDialogDescription className="whitespace-pre-line">
            Folgende Karten haben ungespeicherte Änderungen:
            {"\n"}{list}
            {"\n\n"}Möchten Sie alle Änderungen speichern?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-500 hover:bg-red-600"
            onClick={onDiscardAll}
          >
            Alle verwerfen
          </AlertDialogAction>
          <AlertDialogAction onClick={onSaveAll}>
            Alle speichern
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
