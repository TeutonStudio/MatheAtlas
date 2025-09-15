// ./src/Atlas/Karten/KontextMenüs.tsx

import React from "react";
import { type Kontext } from "@/Atlas/Karten.types.ts";
import { PaneItems, NodeItems, EdgeItems, Shell } from './KontextMenüKomponenten';

export default function KontextMenü({ ctx }: { ctx: Kontext }) {
  const style: React.CSSProperties = {
    position: "fixed",
    left: ctx.pos.x,
    top: ctx.pos.y,
    zIndex: 50,
  }; 

  switch (ctx.variante) {
    case "Pane":
      return <Shell style={style}><PaneItems onClose={ctx.onClick} scope={ctx.scope} position={ctx.pos} /></Shell>;
    case "Node":
      return <Shell style={style}><NodeItems id={ctx.id} onClose={ctx.onClick} /></Shell>;
    case "Edge":
      return <Shell style={style}><EdgeItems id={ctx.id} onClose={ctx.onClick} /></Shell>;
  }
}
