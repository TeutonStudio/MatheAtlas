// ./src/Atlas/Karten/InstanzierbareKnotenDialog.tsx

import React from 'react';
import { type XYPosition, type Node } from '@xyflow/react';

import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';

import { KNOTEN } from '@/Atlas/Karten.types.ts';

import { useKartenStore } from '@/Ordnung/DatenBank/KartenStore';

const vordefinierteKnoten = [
  { id: 'latex', name: 'LaTeX Knoten' },
  { id: 'schnittstelle', name: 'Schnittstellen Knoten' },
];

function InstanzierbareKnotenDialogContent({
  position,
  onClose,
}: {
  position: XYPosition;
  onClose: () => void;
}) {
  const { db, aktiveKarteId, hatZirkulaereAbhaengigkeit, addKartenKnoten, onNodesChange } = useKartenStore();

  const handleSelect = (kartenId: string, type: 'karte' | 'vordefiniert') => {
    if (!aktiveKarteId) return;

    if (type === 'karte') {
      if (hatZirkulaereAbhaengigkeit(aktiveKarteId, kartenId)) {
        toast.error('Zirkuläre Abhängigkeit entdeckt! Die Karte kann nicht hinzugefügt werden.');
        return;
      }
      addKartenKnoten(kartenId, position);
    } else {
      let newNode: Node<{ latex: string } | { schnittstellenId: string }> | undefined;
      if (kartenId === 'latex') {
        newNode = {
          id: `latex-${nanoid()}`,
          type: KNOTEN.LaTeX,
          position,
          data: { latex: 'E=mc^2' },
        };
      } else if (kartenId === 'schnittstelle') {
        newNode = {
          id: `schnittstelle-${nanoid()}`,
          type: KNOTEN.Schnittstelle,
          position,
          data: { schnittstellenId: 'neu' },
        };
      }
      if (newNode && onNodesChange) {
        onNodesChange([{ type: 'add', item: newNode }]);
      }
    }
    onClose();
  };

  const instanziierbareKarten = Object.values(db).filter(
    (karte) =>
      karte.id &&
      aktiveKarteId &&
      karte.id !== aktiveKarteId &&
      !hatZirkulaereAbhaengigkeit(aktiveKarteId, karte.id)
  );

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Instanzierbare Knoten</DialogTitle>
        <DialogDescription>
          Wählen Sie einen Knotentyp oder eine vorhandene Karte aus, um sie der aktuellen Karte hinzuzufügen.
        </DialogDescription>
      </DialogHeader>
      <ScrollArea className="h-72 w-full rounded-md border">
        <div className="p-4">
          <h4 className="mb-2 text-sm font-medium leading-none">Vordefinierte Knoten</h4>
          {vordefinierteKnoten.map((knoten) => (
            <div
              key={`vordefiniert-${knoten.id}`}
              className="text-sm p-2 hover:bg-accent rounded-md cursor-pointer"
              onClick={() => handleSelect(knoten.id, 'vordefiniert')}
            >
              {knoten.name}
            </div>
          ))}
          <h4 className="my-2 text-sm font-medium leading-none">Karten</h4>
          {instanziierbareKarten.map((karte) => (
            <div
              key={`karte-${karte.id}`}
              className="text-sm p-2 hover:bg-accent rounded-md cursor-pointer"
              onClick={() => handleSelect(karte.id, 'karte')}
            >
              {karte.name}
            </div>
          ))}
        </div>
      </ScrollArea>
    </DialogContent>
  );
}
