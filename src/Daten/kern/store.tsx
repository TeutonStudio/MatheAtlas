// ./src/Daten/kern/store.tsx

import * as React from "react";

import { type Val } from "./logik.ts";

type EvalStore = {
  version: number;
  readCache: (k: string) => Val | undefined;
  writeCache: (k: string, v: Val) => void;
  bump: () => void;
};

const Ctx = React.createContext<EvalStore | null>(null);

export function EvalStoreProvider({ children }: { children: React.ReactNode }) {
  const cacheRef = React.useRef(new Map<string, Val>());
  const [version, setVersion] = React.useState(1);

  const api: EvalStore = {
    version,
    readCache: k => cacheRef.current.get(k),
    writeCache: (k, v) => cacheRef.current.set(k, v),
    bump: () => { cacheRef.current.clear(); setVersion(v => v + 1); },
  };
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useEvalStore() {
  const s = React.useContext(Ctx);
  if (!s) throw new Error("EvalStoreProvider fehlt");
  return s;
}