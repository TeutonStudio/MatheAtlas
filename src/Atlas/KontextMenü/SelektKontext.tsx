/// ./src/Atlas/KontextMenü/SelektKontext.tsx

import { useKartenStore } from '@/Ordnung/DatenBank/KartenStore';
import { Item } from "@/Atlas/KontextMenü/methoden.tsx";

type SelektItemKontext = { ids?: string[]; onClose: () => void }

export default function SelektItems(argumente: SelektItemKontext) {
  const { ids, onClose } = argumente;
  const oeffneUmbenennenDialog = useKartenStore(s => s.oeffneUmbenennenDialog)
  
  return (
    <div className="min-w-44">
      <Item onSelect={onClose}>Knoten gruppieren TODO</Item>
      <Item onSelect={onClose}>Knoten duplizieren TODO</Item>
      <KnotenLöschen ids={ids} onClose={onClose} />
      <div className="px-3 pt-1 text-xs opacity-60">ID: {ids}</div>
    </div>
  );
}

function KnotenLöschen({ids,onClose}:{ids:string[] | undefined,onClose:() => void}) {
  if (!ids) return;
  const löschen = useKartenStore(s => s.deleteNodeById)
  const onSelect = () => {
    ids.map((id:string) => löschen(id))
    onClose()
  }
  return <Item onSelect={onSelect} >Knoten löschen</Item>
}
