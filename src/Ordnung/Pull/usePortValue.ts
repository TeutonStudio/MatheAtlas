// ./src/Ordnung/Pull/usePortValue.ts

import * as React from "react";
import { useKartenStore } from "@/Ordnung/DatenBank/KartenStore";
import { pull } from "./runtime";
import type { PortRef, PullResult } from "./types";

export function usePortValue(ref: PortRef) {
  const gv = useKartenStore(s => s.graphVersion?.[ref.kartenId] ?? 0);
  const dv = useKartenStore(s => s.nodeDataVersions?.[ref.kartenId]?.[ref.nodeId] ?? 0);
  const [res, setRes] = React.useState<PullResult>();

  React.useEffect(() => {
    let dead = false;
    pull(ref).then(r => { if (!dead) setRes(r); });
    return () => { dead = true; };
  }, [ref.kartenId, ref.nodeId, ref.handleId, gv, dv]);

  return res;
}
