// ./src/Atlas/Anschlüsse/AnschlussLeiste.tsx

import { useMemo } from "react";
import { Position, useNodeId, useStore } from "@xyflow/react";

import { Variante, Fluß, type AnschlussLeisteArgumente, AnschlussDefinition, EingangsDefinition } from "@/Atlas/Anschlüsse.types";
import { erhalteId, SEPARATOR } from "@/Atlas/Anschlüsse/methoden";

import DatenAnschluss from "@/Atlas/Anschlüsse/DatenAnschluss";
import MultiAnschlussLeiste from "@/Atlas/Anschlüsse/MultiAnschlussLeiste";

const edgePaddingPctSt = 10

export default function AnschlussLeiste(argumente: AnschlussLeisteArgumente) {
  //const { nodeId: propNodeId, seite, anschlussListe, edgePaddingPct = 10 } = argumente;
  const anschlüsse = argumente.anschlussListe(argumente.seite);
  //const contextNodeId = useNodeId();
  const nodeId = argumente.nodeId ?? useNodeId();

  const edges = useStore(s => s.edges);

  const flatHandles = useMemo(() => {
    if (!nodeId || !anschlüsse?.length) return [];

    const rows: Array<{ handleId: string; defIndex: number; globalIndex: number }> = [];
    let globalIndex = 0;

    anschlüsse.forEach((def, defIndex) => {
      const basisTeile: (string | number)[] = [def.id, def.dtype, def.fluss, def.variante];

      if (def.variante === Variante.Einzel) {
        rows.push({ handleId: erhalteId(basisTeile), defIndex, globalIndex: globalIndex++ });
      } else {
        const basisId = erhalteId(basisTeile);

        // Verbindungen am *eigenen* Knoten zählen
        const cnt = edges.filter(kante => {
          return (kante.target === nodeId && kante.targetHandle?.startsWith(basisId + SEPARATOR));
        }).length;

        const anzahlHandles = Math.max(1, cnt + 1); // immer ein freier Anschluss
        for (let j = 0; j < anzahlHandles; j++) {
          rows.push({
            handleId: erhalteId([...basisTeile, j]),
            defIndex,
            globalIndex: globalIndex++,
          });
        }
      }
    });

    return rows;
  }, [nodeId, anschlüsse, edges]);

  if (!nodeId || !flatHandles.length) return null;

  const anzahlAnschlüsseTotal = flatHandles.length;
  const innenBereich = 100 - 2 * (argumente.edgePaddingPct ?? edgePaddingPctSt);
  const slotGröße = innenBereich / anzahlAnschlüsseTotal;

  function ankerProzentFuer(index: number): number {
    if (anzahlAnschlüsseTotal === 1) return 50;
    return (argumente.edgePaddingPct ?? edgePaddingPctSt) + index * slotGröße + slotGröße / 2;
  }

  const containerStyle: React.CSSProperties = {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    pointerEvents: "none",
    zIndex: 4, // über dem Header-Content
  };

  const istVertikal = argumente.seite === Position.Left || argumente.seite === Position.Right;

  return (
    <div style={containerStyle}>
      {anschlüsse.map((def, i) => {
        const handlesForThisDef = flatHandles.filter(h => h.defIndex === i);
        if (!handlesForThisDef.length) return null;

        if (def.variante === Variante.Einzel) {
          const handle = handlesForThisDef[0];
          const ankerProzent = ankerProzentFuer(handle.globalIndex);
          return (
            <DatenAnschluss
              key={handle.handleId}
              handleId={handle.handleId}
              position={argumente.seite}
              fluss={def.fluss}
              datenTyp={def.dtype}
              topPct={istVertikal ? ankerProzent : undefined}
              leftPct={!istVertikal ? ankerProzent : undefined}
            />
          );
        } else {
          const firstHandle = handlesForThisDef[0];
          const anzahlHandlesInGroup = handlesForThisDef.length;

          const pillSize = slotGröße * anzahlHandlesInGroup;
          const pillCenter = ankerProzentFuer(firstHandle.globalIndex) + pillSize / 2 - slotGröße / 2;

          return (
            <MultiAnschlussLeiste
              key={def.id}
              nodeId={nodeId!}
              position={argumente.seite}
              definition={def as EingangsDefinition}
              handleIds={handlesForThisDef.map(h => h.handleId)}
              topPct={istVertikal ? pillCenter : undefined}
              leftPct={!istVertikal ? pillCenter : undefined}
              heightPct={istVertikal ? pillSize : undefined}
              widthPct={!istVertikal ? pillSize : undefined}
            />
          );
        }
      })}
    </div>
  );
}
