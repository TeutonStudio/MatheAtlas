/// ./src/Atlas/Karten/Karte.tsx

import { useState, useCallback, useRef } from "react";
import { ReactFlow, Controls, MiniMap, Background, BackgroundVariant, Panel, type NodeTypes, type Node, type Edge, type Connection, Viewport } from "@xyflow/react";
import { useShallow } from "zustand/react/shallow";

import { KartenDefinition, KNOTEN, type KarteArgumente, type Kontext } from "@/Atlas/Karten.types.ts";
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

  const closeMenu = useCallback(() => setMenu(undefined), []);
  
  function selectNode(id:string) {
    const selekt = nodes.find(n => n.id === id) as Node
    if (!selekt || selekt.selected === true) return;
    const selectChanges = nodes.map(n => ({
      id: n.id,
      type: "select" as const,
      selected: n.id === id,
    }));
    setSelectionSnapshot({ nodeIds: [id], edgeIds: [] });
    onNodesChange(selectChanges);

  }
  function erhalteMenu(objekt: Node | Edge | KartenDefinition | Node[], event: React.MouseEvent | MouseEvent) {
    const variante = isNode(objekt) ? "Node" : isEdge(objekt) ? "Edge" : isKartenDefinition(objekt) ? "Pane" : "Selekt"
    const ids = variante === "Selekt" ? (objekt as Node[]).map(n => n.id) : []
    const id = variante !== "Selekt" ? (objekt as Node | Edge | KartenDefinition).id : ""
    return { variante, id, ids, pos: menuPos(event), scope, onClick: closeMenu } as Kontext
  }
  const onNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault(); selectNode(node.id);
    setMenu(erhalteMenu(node,event))
    //setMenu({ variante: "Node", id: node.id, pos: menuPos(event), scope, onClick: onPaneClick });
  }, [scope]);
  
  const onEdgeContextMenu = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.preventDefault();
    setMenu(erhalteMenu(edge,event))
    //setMenu({ variante: "Edge", id: edge.id, pos: menuPos(event), scope, onClick: onPaneClick });
  }, [scope]);

  const onPaneContextMenu = useCallback((event: React.MouseEvent | MouseEvent) => {
    event.preventDefault();
    if (!definition) return;
    setMenu(erhalteMenu(definition,event))
    //setMenu({ variante: "Pane", id: aktiveKarteId ?? "", pos: menuPos(event), onClick: onPaneClick });
  }, [scope]);

  const onSelectionContextMenu = useCallback((event: React.MouseEvent, nodes: Node[]) => {
    event.preventDefault();
    setMenu(erhalteMenu(nodes,event))
  }, []);

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

  const onPaneClick = useCallback((event: React.MouseEvent) => {
    closeMenu();
  }, [closeMenu]);

  const onMoveStart = useCallback((event: MouseEvent | TouchEvent | null, viewport: Viewport) => {
    closeMenu();
  }, [closeMenu]);

  const onMoveEnd = useCallback((event: MouseEvent | TouchEvent | null, viewport: Viewport) => {
    // TODO
  }, []);

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
  };
  const defaultViewport = { x: 0, y: 0, zoom: 2 } as Viewport;
  const ReactFlowArgument = {
    nodes, edges, nodeTypes: KnotenVarianten,
    onNodesChange, onEdgesChange,
    onConnect, onReconnect, onPaneClick,
    onNodeContextMenu, onEdgeContextMenu,
    onPaneContextMenu, onSelectionContextMenu, 
    onSelectionChange, onMoveStart, onMoveEnd,
    elementsSelectable: selectionEnabled,
    selectionOnDrag: selectionEnabled,
    multiSelectionKeyCode: "Control",
    panOnDrag: !selectionEnabled ? true : undefined,
    minZoom: .05, maxZoom: 100, defaultViewport,
    fitView: true,
  }

  return (
    <div ref={ref} style={{ width: "100%", height: "100%" }}>
      <ReactFlow {...ReactFlowArgument} >
        <Panel position="top-center"><Pfad /></Panel>
        <Panel position="center-right"><Atlas karte={{definition, offene}} /></Panel>
        <Panel position="bottom-left" style={{ left: controlsLeft }}>
          <div className="rf-bottom-bar" style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            {/* Controls und MiniMap werden in diesem Panel „normal“ gelayoutet */}
            <MiniMap style={{ position: "static", width: 220, height: 180 }} />
            <Controls style={{ position: "static" }} />
          </div>
        </Panel>
        <Background color={hintergrundFarbe} variant={BackgroundVariant.Dots} />
        {menu && <KontextMenü ctx={menu} />}
      </ReactFlow>
    </div>
  );
}

function isEdge(x: unknown): x is Edge {
  return !!x && typeof x === "object" && "source" in (x as any) && "target" in (x as any);
}
function isNode(x: unknown): x is Node {
  return !!x && typeof x === "object" && "position" in (x as any) && !("source" in (x as any));
}
function isKartenDefinition(x: unknown): x is KartenDefinition {
  return !!x && typeof x === "object" && "nodes" in (x as any) && "edges" in (x as any);
}


import BasisKnoten from "@/Atlas/Knoten/BasisKnoten.tsx";
import LaTeXKnoten from "@/Atlas/Knoten/LaTeXKnoten.tsx"
import SchnittstellenKnoten from "@/Atlas/Knoten/SchnittstellenKnoten.tsx";
import KartenKnoten from "@/Atlas/Knoten/KartenKnoten.tsx";
import LogikKnoten from "@/Atlas/Knoten/LogikKnoten.tsx";
import ElementKnoten from "@/Atlas/Knoten/ElementKnoten";
import VariableKnoten from "@/Atlas/Knoten/VariableKnoten";
import ParameterKnoten from "../Knoten/ParameterKnoten";
import AuswertungsKnoten from "../Knoten/AuswertungsKnoten";
import RechenKnoten from "../Knoten/RechenKnoten";

export const KnotenVarianten: NodeTypes = {
  [KNOTEN.Basis]: BasisKnoten,
  [KNOTEN.LaTeX]: LaTeXKnoten,
  [KNOTEN.Schnittstelle]: SchnittstellenKnoten,
  [KNOTEN.Variable]: VariableKnoten,
  [KNOTEN.Parameter]: ParameterKnoten,
  [KNOTEN.KartenKnoten]: KartenKnoten,
  [KNOTEN.Logik]: LogikKnoten,
  [KNOTEN.Element]: ElementKnoten,
  [KNOTEN.Auswertung]: AuswertungsKnoten,
  [KNOTEN.Rechen]: RechenKnoten,
};
