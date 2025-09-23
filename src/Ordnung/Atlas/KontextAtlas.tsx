/// ./src/Ordnung/Atlas/KontextAtlas.tsx

import { useMemo } from "react";

import { OffeneKarte, SelectionSnapshot } from "@/Ordnung/datenbank.types.ts";
import { useKartenStore } from "@/Ordnung/DatenBank/KartenStore.ts";

import KartenAtlas from "@Atlas/KartenAtlas.tsx";
import KnotenAtlas from "@Atlas/KnotenAtlas.tsx";
import { KartenDefinition } from "@Karten.types.ts";


export default function Atlas({karte}:{karte: {definition:KartenDefinition | undefined, offene: OffeneKarte | undefined}}) {
  //const { aktiveKarteId, findKarte, geöffnet } = useKartenStore();
  //const karte = findKarte(aktiveKarteId ?? ""); if(!karte) return;
  //const dirty = geöffnet[aktiveKarteId ?? ""].dirty;
  //if (!karte.definition || !karte.offene || karte.offene.scope==="defined") return;
  const definition = karte.definition;
  const offene = karte.offene;
  
  const selektion = useKartenStore(s => s.selection);
  const selectedNode = useMemo(() => {
    const id = selektion.nodeIds[0];
    return karte.offene!.nodes.find(n => n.id === id) ?? undefined;
  }, [karte, selektion]); // if (!selectedNode) return;
  //const selectedCount = (selection?.nodeIds?.length ?? 0) + (selection?.edgeIds?.length ?? 0);
  
  if (!definition || !offene) return;
  //console.log(selectedNode,erhalteSelektionsArt(selektion))
  switch (erhalteSelektionsArt(selektion)) {
    case "none": return <KartenAtlas karte={{definition,offene}} />
    case "single": return <KnotenAtlas node={selectedNode} />
    case "multi": console.log(selektion)
    default: console.log("Dummheit muss weh tun")
  }
}
  
type SelektionsArt = "none" | "single" | "multi";

function erhalteSelektionsArt(selektion:SelectionSnapshot): SelektionsArt {
  const nodeAnzahl = selektion?.nodeIds?.length ?? 0;
  const edgeAnzahl = selektion?.edgeIds?.length ?? 0;
  function summeIst(anzahl:number): boolean { return nodeAnzahl + edgeAnzahl === anzahl }
  return summeIst(0) ? "none" : summeIst(1) ? "single" : "multi";
} 
