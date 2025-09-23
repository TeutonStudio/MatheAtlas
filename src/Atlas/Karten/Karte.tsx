/// ./src/Atlas/Karten/Karte.tsx

import { useState, useCallback, useRef } from "react";
import { ReactFlow, Controls, MiniMap, Background, BackgroundVariant, Panel, type NodeTypes, type Node, type Edge, type Connection } from "@xyflow/react";
import { useShallow } from "zustand/react/shallow";

import { KNOTEN, type KarteArgumente, type Kontext } from "@/Atlas/Karten.types.ts";
import { KartenState } from "@/Ordnung/datenbank.types";

import { useKartenStore } from "@/Ordnung/DatenBank/KartenStore";
import { KontextMenü, menuPos } from "@/Atlas/Karten/methoden";
import Pfad from "@/Atlas/Karten/Pfad";
import Atlas from "@/Ordnung/Atlas/KontextAtlas";


export default function Karte(argumente: KarteArgumente) {
  const { hintergrundFarbe, controlsLeft } = argumente;
  const select = useShallow((s: KartenState) => {
    const id = s.aktiveKarteId;
    return {
      aktiveKarteId: id,
      offene: id ? s.geöffnet[id] : undefined,
      definition: id ? s.db[id] : undefined,
      onNodesChange: s.onNodesChange,
      onEdgesChange: s.onEdgesChange,
      onConnectStore: s.onConnect,
      onReconnectStore: s.onReconnect,
    };
  }); const {
    aktiveKarteId,
    offene,
    definition,
    onNodesChange,
    onEdgesChange,
    onConnectStore,
    onReconnectStore,
  } = useKartenStore(select);// if (!aktiveKarteId || !offene || !definition) return;

  const [menu, setMenu] = useState<Kontext>();
  const ref = useRef<HTMLDivElement | null>(null);

  const scope = offene?.scope ?? "defined"
  const selectionEnabled = scope !== "defined";

  const setSelectionSnapshot = useKartenStore(s => s.setSelectionSnapshot);
  const clearSelectionSnapshot = useKartenStore(s => s.clearSelectionSnapshot);


  const onPaneClick = useCallback(() => setMenu(undefined), []);
  const onNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    setMenu({ variante: "Node", id: node.id, pos: menuPos(event), scope, onClick: onPaneClick });
  }, [onPaneClick,scope]);
  const onEdgeContextMenu = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.preventDefault();
    setMenu({ variante: "Edge", id: edge.id, pos: menuPos(event), scope, onClick: onPaneClick });
  }, [onPaneClick, scope]);
  const onPaneContextMenu = useCallback((event: React.MouseEvent | MouseEvent) => {
    event.preventDefault();
    setMenu({ variante: "Pane", id: aktiveKarteId ?? "", pos: menuPos(event), onClick: onPaneClick });
  }, [onPaneClick, scope]);
  const onSelectionChange = useCallback((params: { nodes: Node[]; edges: Edge[] }) => {
    if (!selectionEnabled) return;
    setSelectionSnapshot({
      nodeIds: (params.nodes ?? []).map(n => n.id),
      edgeIds: (params.edges ?? []).map(e => e.id),
    });
  }, [selectionEnabled, setSelectionSnapshot]);

  const onConnect = useCallback(
    (params: Connection) => { onConnectStore(params); },
    [onConnectStore]
  );

  const onReconnect = useCallback(
    (oldEdge: Edge, conn: Connection) => { onReconnectStore(oldEdge, conn); },
    [onReconnectStore]
  );

  const nodes = (offene ?? {nodes: []}).nodes
  const edges = (offene ?? {edges: []}).edges

  if (false) {
    console.log("Karte: ",nodes,edges)
    for (const n of offene!.nodes ?? []) {
      const x = Number((n as any)?.position?.x);
      const y = Number((n as any)?.position?.y);
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        console.warn("Bad node position", n.id, n.position);
        n.position = { x: 0, y: 0 };
        break;
      }
    }
  }

  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={nodes} edges={edges}
        nodeTypes={KnotenVarianten}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onReconnect={onReconnect}
        onPaneClick={onPaneClick}
        onNodeContextMenu={onNodeContextMenu}
        onEdgeContextMenu={onEdgeContextMenu}
        onPaneContextMenu={onPaneContextMenu}
        onSelectionChange={onSelectionChange}
        elementsSelectable={selectionEnabled}
        selectionOnDrag={selectionEnabled}
        multiSelectionKeyCode="Control"
        panOnDrag={!selectionEnabled ? true : undefined}
        minZoom={.05}
        maxZoom={100}
        defaultViewport={{ x: 0, y: 0, zoom: 2 }}
        fitView
      >
        <Panel position="top-center"><Pfad /></Panel>
        <Panel position="center-right"><Atlas karte={{definition, offene}} /></Panel>
        <Background color={hintergrundFarbe} variant={BackgroundVariant.Dots} />
        <Controls position="bottom-left" style={{ ...(controlsLeft ? { left: controlsLeft } : {}), right: "auto" }} />
        <MiniMap />
        {menu && <KontextMenü ctx={menu} />}
      </ReactFlow>
    </div>
  );
}




import BasisKnoten from "@/Atlas/Knoten/BasisKnoten.tsx";
import LaTeXKnoten from "@/Atlas/Knoten/LaTeXKnoten.tsx"
import SchnittstellenKnoten from "@/Atlas/Knoten/SchnittstellenKnoten.tsx";
import KartenKnoten from "@/Atlas/Knoten/KartenKnoten.tsx";
import LogikTabelleKnoten from "@/Atlas/Knoten/LogikTabelleKnoten.tsx";
import ElementKnoten from "@/Atlas/Knoten/ElementKnoten";

export const KnotenVarianten: NodeTypes = {
  [KNOTEN.Basis]: BasisKnoten,
  [KNOTEN.LaTeX]: LaTeXKnoten,
  [KNOTEN.Schnittstelle]: SchnittstellenKnoten,
  [KNOTEN.KartenKnoten]: KartenKnoten,
  [KNOTEN.LogikTabelle]: LogikTabelleKnoten,
  [KNOTEN.Element]: ElementKnoten,
};
