// ./src/Atlas/Karten/Karte.tsx
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { ReactFlow, Controls, MiniMap, Background, BackgroundVariant, Panel, type Node, type Edge } from "@xyflow/react";
import { KnotenVarianten, type KarteArgumente, type Kontext } from "@/Atlas/Karten.types";
import Pfad from "@/Atlas/Karten/Pfad";
import KnotenAtlas from "@/Ordnung/KnotenAtlas";
import KontextMenü from "@/Atlas/Karten/KontextMenüs";

function menuPos(e: MouseEvent | React.MouseEvent, pad = 8) {
  const x = Math.min(e.clientX + 2, window.innerWidth - pad);
  const y = Math.min(e.clientY + 2, window.innerHeight - pad);
  return { x, y };
}

export default function Karte(argumente: KarteArgumente) {
  const { nodes: originalNodes, edges, onNodesChange, onEdgesChange, onConnect, hintergrundFarbe, controlsLeft, scope } = argumente;
  const [menu, setMenu] = useState<Kontext>();
  const ref = useRef<HTMLDivElement | null>(null);

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

  const nodes = useMemo(() => {
    return originalNodes.map(node => {
      return {
        ...node,
        deletable: scope === "private" ? true : false,
        draggable: scope === "defined" ? false : true,
      };
    });
  }, [originalNodes, scope]);

  for (const n of nodes ?? []) {
    const x = Number((n as any)?.position?.x);
    const y = Number((n as any)?.position?.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      console.warn("Bad node position", n.id, n.position);
      n.position = { x: 0, y: 0 };
      break;
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
        onPaneClick={onPaneClick}
        onNodeContextMenu={onNodeContextMenu}
        onEdgeContextMenu={onEdgeContextMenu}
        onPaneContextMenu={onPaneContextMenu}
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
        {menu && <KontextMenü ctx={menu} />}
      </ReactFlow>
    </div>
  );
}