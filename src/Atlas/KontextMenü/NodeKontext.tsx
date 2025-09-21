// ./src/Atlas/KontextMenü/NodeKontext.tsx

import { useKartenStore } from '@/Ordnung/DatenBank/KartenStore';
import { Item } from "@/Atlas/KontextMenü/methoden.tsx";

export default function NodeItems({ id, onClose }: { id?: string; onClose?: () => void }) {
  const oeffneUmbenennenDialog = useKartenStore(s => s.oeffneUmbenennenDialog)
  return (
    <div className="min-w-44">
      <Item onSelect={() => {
        if (id) oeffneUmbenennenDialog(id)
        onClose?.()
      }}>Knoten umbenennen</Item>
      <Item onSelect={onClose}>Knoten duplizieren</Item>
      <Item onSelect={onClose}>Knoten löschen</Item>
      <Item onSelect={onClose}>Als Vorlage speichern</Item>
      <div className="px-3 pt-1 text-xs opacity-60">ID: {id}</div>
    </div>
  );
}
