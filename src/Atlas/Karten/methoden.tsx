/// ./src/Atlas/Karten/methoden.ts

import React from "react";

import { Verlauf } from "@/Ordnung/datenbank.types";
import { Kontext } from "@/Atlas/Karten.types";

import PaneItems from "@/Atlas/KontextMenü/PaneKontext";
import NodeItems from "@/Atlas/KontextMenü/NodeKontext";
import EdgeItems from "@/Atlas/KontextMenü/EdgeKontext";


export function erhalteText(v: Verlauf): string {
    return (v.dirty ? "*" : "") + v.name
}


export function KontextMenü( { ctx }: { ctx: Kontext } ) {
  const style: React.CSSProperties = {
    position: "fixed",
    left: ctx.pos.x,
    top: ctx.pos.y,
    zIndex: 50,
  }; 
  function Inhalt() {
    switch (ctx.variante) {
        case "Pane": return <PaneItems id={ctx.id} onClose={ctx.onClick} position={ctx.pos} />;
        case "Node": return <NodeItems id={ctx.id} onClose={ctx.onClick} />;
        case "Edge": return <EdgeItems id={ctx.id} onClose={ctx.onClick} />;
    }
  }

  return <Hülle style={style}><Inhalt /></Hülle>
}


type HüllenArgumente = { style: React.CSSProperties; children: React.ReactNode }

// ./src/Atlas/KontextMenü/methoden.tsx
export function Hülle(argumente:HüllenArgumente) {
  const { style, children } = argumente;
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;

      // Wenn irgendein Radix-Dialog offen ist: NICHT schließen
      // Das deckt alle shadcn/Radix Dialoge ab, auch wenn data-Attribute variieren.
      const anyDialogOpen =
        document.querySelector('[data-radix-portal] [role="dialog"][data-state="open"]') ||
        document.querySelector('[data-radix-dialog-content][data-state="open"]');

      if (anyDialogOpen) {
        return;
      }

      if (ref.current && target && !ref.current.contains(target)) {
        // @ts-expect-error: child kann onClose besitzen
        children?.props?.onClose?.();
      }
    };

    // WICHTIG: bubble-Phase benutzen, nicht capture
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, [children]);

  return (
    <div ref={ref} style={style} className="rounded-xl border bg-popover p-2 shadow-lg">
      {children}
    </div>
  );
}

export function menuPos(e: MouseEvent | React.MouseEvent, pad = 8) {
  const x = Math.min(e.clientX + 2, window.innerWidth - pad);
  const y = Math.min(e.clientY + 2, window.innerHeight - pad);
  return { x, y };
}
