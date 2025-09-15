// ./src/Ordnung/Struktur.tsx

import React, { useCallback } from "react";
import { ReactFlowProvider, type Connection } from "@xyflow/react";

import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

import { type StrukturArgumente, type LayoutArgumente } from "@/Ordnung/programm.types.ts";
import KartenAtlas from "@/Ordnung/KartenAtlas.tsx";
import Karte from "@/Atlas/Karten/Karte.tsx";
import { useKartenStore } from "@/Ordnung/DatenBank/KartenStore.ts";
import { DialogManager } from "@/Ordnung/DialogManager.tsx";

// Eval-Store: unser Pull-/Cache-/Version-Context
import { EvalStoreProvider } from "@/Daten/kern/store.tsx";

const rootStyle   = { display: "flex", width: "100vw", height: "100vh", overflow: "hidden" } as const;
const centerStyle = { position: "relative", flex: 1, height: "100%" } as const;

const SIDEBAR_W = "var(--sidebar-width, 280px)";
const SIDEBAR_DIVIDER = "var(--sidebar-divider, 1px)";
const SIDEBAR_GAP = "var(--sidebar-gap, 12px)";
const TRIGGER_NUDGE = "var(--trigger-nudge, 16px)";

function isOpen(state: string) { return state !== "collapsed" && state !== "hidden"; }
function slideTx(state: string) { return isOpen(state) ? "0px" : `calc(-1 * ${SIDEBAR_W})`; }

export default function ProgrammStruktur({ firstStyle, secondStyle }: StrukturArgumente) {
  // initiale Vorlage optional in DB laden (einmalig)
  console.log("ProgrammStruktur rendered");
  const hasInit = React.useRef(false);
  const db = useKartenStore(s => s.db);
  const oeffneKarte = useKartenStore(s => s.oeffneKarte);

  React.useEffect(() => {
    if (hasInit.current) return;
    hasInit.current = true;
    const demoKarte = Object.values(db).find(k => k.name === "Demo Karte");
    if (demoKarte) oeffneKarte(demoKarte.id);
  }, [db, oeffneKarte]);

  return (
    <SidebarProvider defaultOpen>
      {/* EvalStoreProvider ÜBER ReactFlowProvider, damit Sidebar/Atlas ebenfalls bump() können */}
      <EvalStoreProvider>
        <InneresLayout firstStyle={firstStyle} secondStyle={secondStyle} />
        <DialogManager />
      </EvalStoreProvider>
    </SidebarProvider>
  );
}

function InneresLayout({ firstStyle, secondStyle }: LayoutArgumente) {
  console.log("InneresLayout rendered");
  const { state } = useSidebar();
  const open = isOpen(state);
  const tx = slideTx(state);
  const controlsLeft = open
    ? `calc(${SIDEBAR_W} + ${SIDEBAR_DIVIDER} + ${SIDEBAR_GAP} + ${TRIGGER_NUDGE})`
    : "12px";

  const store = useKartenStore();
  const activeCard = store.aktiveKarteId ? store.geöffnet[store.aktiveKarteId] : null;

  const onConnect = useCallback((params: Connection) => {
    store.onConnect(params);
  }, [store]);

  return (
    <div style={firstStyle ?? rootStyle}>
      <div style={secondStyle ?? centerStyle}>
        <ReactFlowProvider>
        {activeCard ? (
          <Karte
            nodes={activeCard.nodes}
            edges={activeCard.edges}
            onNodesChange={store.onNodesChange}
            onEdgesChange={store.onEdgesChange}
            onConnect={onConnect}
            controlsLeft={controlsLeft}
            scope={activeCard.scope}
          />
           ) : (
            <div>Keine Karte ausgewählt</div>
          )}
        </ReactFlowProvider>

        <div
          data-sidebar-overlay
          style={{
            position: "absolute",
            top: 0, left: 0, bottom: 0,
            width: SIDEBAR_W,
            zIndex: 40,
            transition: "transform 200ms ease",
            transform: `translateX(${tx})`,
            pointerEvents: open ? "auto" : "none",
          }}
        >
          <KartenAtlas />
        </div>

        <div
          style={{
            position: "absolute",
            top: 12, left: 0,
            zIndex: 50,
            width: SIDEBAR_W,
            height: 0,
            transition: "transform 200ms ease",
            transform: `translateX(${tx})`,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: `calc(100% + var(--sidebar-divider, 1px) + var(--sidebar-gap, 12px))`,
              transform: open ? `translateX(${TRIGGER_NUDGE})` : "none",
            }}
          >
            <div style={{ pointerEvents: "auto" }}>
              <SidebarTrigger />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}