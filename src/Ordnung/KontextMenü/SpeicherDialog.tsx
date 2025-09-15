import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from "@/components/ui/alert-dialog"
  
  interface SpeicherDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: () => void;
    onDiscard: () => void;
    kartenName: string;
  }
  
  export function SpeicherDialog({ open, onClose, onSave, onDiscard, kartenName }: SpeicherDialogProps) {
    if (!open) return null;
  
    return (
      <AlertDialog open={open} onOpenChange={onClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ungespeicherte Änderungen</AlertDialogTitle>
            <AlertDialogDescription>
              Sie haben ungespeicherte Änderungen in der Karte "{kartenName}". Möchten Sie diese speichern?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onClose}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={onDiscard} className="bg-red-500 hover:bg-red-600">Verwerfen</AlertDialogAction>
            <AlertDialogAction onClick={onSave}>Speichern</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }
  