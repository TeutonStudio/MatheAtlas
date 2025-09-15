
// ./src/Ordnung/Benutzer/OrphanedCardsDialog.tsx
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useKartenStore } from '@/Ordnung/DatenBank/KartenStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { type KartenDefinition } from '@/Atlas/Karten.types';

interface OrphanedCardsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export function OrphanedCardsDialog({ open, onOpenChange, userId }: OrphanedCardsDialogProps) {
  const { db, currentUser, assignOrphanedCardsToUser, deleteOrphanedCards } = useKartenStore();
  const [orphanedCards, setOrphanedCards] = useState<KartenDefinition[]>([]);
  const [selectedCards, setSelectedCards] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) {
      const orphans = Object.values(db).filter(card => card.scope === 'private' && !card.userId);
      setOrphanedCards(orphans);
      // Initially, select all cards to be kept
      const initialSelection = orphans.reduce((acc, card) => {
        acc[card.id] = true;
        return acc;
      }, {} as Record<string, boolean>);
      setSelectedCards(initialSelection);
    }
  }, [open, db]);

  const handleToggleCard = (cardId: string) => {
    setSelectedCards(prev => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  const handleSelectAll = () => {
    const allSelected = orphanedCards.reduce((acc, card) => {
      acc[card.id] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setSelectedCards(allSelected);
  };

  const handleDeselectAll = () => {
    setSelectedCards({});
  };

  const handleConfirm = () => {
    if (!currentUser) return;

    const cardsToAssign = Object.keys(selectedCards).filter(id => selectedCards[id]);
    const cardsToDelete = orphanedCards.filter(card => !selectedCards[card.id]).map(c => c.id);

    if (cardsToAssign.length > 0) {
        assignOrphanedCardsToUser(currentUser.id, cardsToAssign);
    }

    if (cardsToDelete.length > 0) {
        // This needs a new method in the store to delete specific cards
        deleteOrphanedCards(cardsToDelete);
    }
    
    toast.success('Karten wurden erfolgreich verwaltet.');
    onOpenChange(false);
  };


  if (orphanedCards.length === 0) {
    return null; // Don't show the dialog if there are no orphaned cards
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Gefundene private Karten</DialogTitle>
          <DialogDescription>
            Es wurden private Karten ohne Besitzer gefunden. Wählen Sie aus, welche Sie Ihrem Konto hinzufügen möchten. Nicht ausgewählte Karten werden gelöscht.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 my-4">
            <Button variant="outline" size="sm" onClick={handleSelectAll}>Alle auswählen</Button>
            <Button variant="outline" size="sm" onClick={handleDeselectAll}>Alle abwählen</Button>
        </div>
        <ScrollArea className="h-72 w-full rounded-md border p-4">
            <div className="space-y-4">
                {orphanedCards.map(card => (
                    <div key={card.id} className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">{card.name}</p>
                            <p className="text-xs text-muted-foreground">Erstellt: {new Date(card.createdAt).toLocaleString()}</p>
                        </div>
                        <Switch
                            id={card.id}
                            checked={selectedCards[card.id] ?? false}
                            onCheckedChange={() => handleToggleCard(card.id)}
                        />
                    </div>
                ))}
            </div>
        </ScrollArea>
        <DialogFooter>
          <Button type="button" onClick={handleConfirm}>
            Bestätigen & Übernehmen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
