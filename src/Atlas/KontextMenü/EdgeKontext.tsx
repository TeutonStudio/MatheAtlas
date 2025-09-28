// ./src/Atlas/KontextMenü/EdgeKontext.tsx

import { type XYPosition, type EdgeChange } from "@xyflow/react";
import { useKartenStore } from '@/Ordnung/DatenBank/KartenStore';
import { Item } from "@/Atlas/KontextMenü/methoden.tsx";
import { type Lebensraum } from "@/Atlas/Karten.types.ts";

type EdgeItemKontext = { id?: string; onClose?: () => void }

export default function EdgeItems(argumente: EdgeItemKontext) {
  const { id, onClose } = argumente;
  const onEdgesChange = useKartenStore((s) => s.onEdgesChange);

  return (
    <div className="min-w-44">
      <LöscheEdge id={id} scope="private" onEdgesChange={onEdgesChange} onClose={onClose} />
      <Item onSelect={onClose}>Stil ändern</Item>
      <div className="px-3 pt-1 text-xs opacity-60">ID: {id}</div>
    </div>
  );
}


function LöscheEdge({id,scope,onEdgesChange,onClose}:{
  id?:string;
  scope:Lebensraum;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onClose?: () => void;
}) {
  if (scope !== "defined") {
    return (
      <Item onSelect={() => {
        if (id) {
          const changes: EdgeChange[] = [{ type: 'remove', id: id }];
          onEdgesChange(changes);
        }
        onClose?.();
      }}>Verbindung löschen</Item>
    )
  }
}
