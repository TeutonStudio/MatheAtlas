/// ./src/Atlas/Karten/Karte.tsx

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { ReactFlow, Controls, MiniMap, Background, useReactFlow, BackgroundVariant, Panel, type Node, type Edge, XYPosition } from "@xyflow/react";
import { KnotenVarianten, type KarteArgumente, type Kontext } from "@/Atlas/Karten.types";
import Pfad from "@/Atlas/Karten/Pfad";
import KnotenAtlas from "@/Ordnung/Atlas/KnotenAtlas";
import { Shell } from "@/Atlas/KontextMenü/methoden.tsx";
import { useKartenStore } from "@/Ordnung/DatenBank/KartenStore";


import PaneItems from "../KontextMenü/PaneKontext";
import NodeItems from "../KontextMenü/NodeKontext";
import EdgeItems from "../KontextMenü/EdgeKontext";

function menuPos(e: MouseEvent | React.MouseEvent, pad = 8) {
  const x = Math.min(e.clientX + 2, window.innerWidth - pad);
  const y = Math.min(e.clientY + 2, window.innerHeight - pad);
  return { x, y };
}

export default function Karte(argumente: KarteArgumente) {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onReconnect, hintergrundFarbe, controlsLeft, scope } = argumente;
  const [menu, setMenu] = useState<Kontext>();
  const { screenToFlowPosition } = useReactFlow();
  const ref = useRef<HTMLDivElement | null>(null);
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
    setMenu({ variante: "Pane", pos: menuPos(event), scope, onClick: onPaneClick });
  }, [onPaneClick, scope]);
  const onSelectionChange = useCallback((params: { nodes: Node[]; edges: Edge[] }) => {
    if (!selectionEnabled) return;
    setSelectionSnapshot({
      nodeIds: (params.nodes ?? []).map(n => n.id),
      edgeIds: (params.edges ?? []).map(e => e.id),
    });
  }, [selectionEnabled, setSelectionSnapshot]);

  if (false) {
    for (const n of nodes ?? []) {
      const x = Number((n as any)?.position?.x);
      const y = Number((n as any)?.position?.y);
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        console.warn("Bad node position", n.id, n.position);
        n.position = { x: 0, y: 0 };
        break;
      }
    }
  }

  
  console.log("Karte: ",nodes,edges)

  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
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
        fitView
      >
        <Panel position="top-center">
          <Pfad />
        </Panel>
        <Panel position="center-right">
          <KnotenAtlas />
        </Panel>
        <Background color={hintergrundFarbe} variant={BackgroundVariant.Dots} />
        <Controls position="bottom-left" style={{ ...(controlsLeft ? { left: controlsLeft } : {}), right: "auto" }} />
        <MiniMap />
        {menu && <KontextMenü ctx={{...menu,screenToFlowPosition}} />}
      </ReactFlow>
    </div>
  );
}


function KontextMenü( { ctx }: { ctx: Kontext & { screenToFlowPosition: (p:XYPosition) => XYPosition} } ) {
  const style: React.CSSProperties = {
    position: "fixed",
    left: ctx.pos.x,
    top: ctx.pos.y,
    zIndex: 50,
  }; 

  switch (ctx.variante) {
    case "Pane":
      return <Shell style={style}><PaneItems onClose={ctx.onClick} scope={ctx.scope} position={ctx.pos} screenToFlowPosition={ctx.screenToFlowPosition} /></Shell>;
    case "Node":
      return <Shell style={style}><NodeItems id={ctx.id} onClose={ctx.onClick} /></Shell>;
    case "Edge":
      return <Shell style={style}><EdgeItems id={ctx.id} onClose={ctx.onClick} /></Shell>;
  }
}