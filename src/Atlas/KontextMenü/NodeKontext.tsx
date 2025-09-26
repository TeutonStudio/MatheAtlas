// ./src/Atlas/KontextMenü/NodeKontext.tsx

import { useKartenStore } from '@/Ordnung/DatenBank/KartenStore';
import { Item } from "@/Atlas/KontextMenü/methoden.tsx";

type NodeItemKontext = { id?: string; onClose: () => void }

export default function NodeItems(argumente: NodeItemKontext) {
  const { id, onClose } = argumente;
  const oeffneUmbenennenDialog = useKartenStore(s => s.oeffneUmbenennenDialog)
  
  return (
    <div className="min-w-44">
      <Item onSelect={() => {
        if (id) oeffneUmbenennenDialog(id)
        onClose?.()
      }}>Knoten umbenennen</Item>
      <Item onSelect={onClose}>Knoten duplizieren</Item>
      <KnotenLöschen id={id} onClose={onClose} />
      <div className="px-3 pt-1 text-xs opacity-60">ID: {id}</div>
    </div>
  );
}

function KnotenLöschen({id,onClose}:{id:string | undefined,onClose:() => void}) {
  if (!id) return;
  const löschen = useKartenStore(s => s.deleteNodeById)
  const onSelect = () => {
    löschen(id)
    onClose()
  }
  return <Item onSelect={onSelect} >Knoten löschen</Item>
}
