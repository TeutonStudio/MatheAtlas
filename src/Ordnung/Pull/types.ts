// ./src/Ordnung/Pull/types.ts


import type { Node, Edge } from "@xyflow/react";

export type DType = "unbestimmt" | "bool" | "number" | "set" | "term";

export type PortWert =
  | { dtype: "bool"; value: boolean }
  | { dtype: "number"; value: number }
  | { dtype: "set"; value: ReadonlySet<unknown> }
  | { dtype: "term"; value: unknown }
  | { dtype: "unbestimmt"; value?: unknown };

export type PullOk = { ok: true; data: PortWert };
export type PullErr = { ok: false; error: string; dtype?: PortWert["dtype"] };
export type PullResult = PullOk | PullErr;

export type PortRef = { kartenId: string; nodeId: string; handleId: string };

export type PullCtx = {
  pull: (ref: PortRef) => Promise<PullResult>;
  getNodeData: <T = unknown>(kartenId: string, nodeId: string) => T | undefined;
  getGraph: (kartenId: string) => { nodes: Node[]; edges: Edge[] } | undefined;
  resolveInput: (args: { kartenId: string; nodeId: string; targetHandleId: string }) => Promise<PullResult>;
};

export type ComputeFn = (ctx: PullCtx, req: { kartenId: string; nodeId: string; outHandleId: string }) => Promise<PullResult>;
