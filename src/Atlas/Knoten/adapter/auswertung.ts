import type { ComputeFn, PullResult } from "@/Ordnung/Pull/types";
import { DatenTypen } from "@/Atlas/Anschlüsse.types";

// IDs exakt wie in buildAuswertungAnschlüsse
const IN_BASE = "in__base";
const IN_SCHNITT = (id: string) => `in__schnittstelle__${id}`;
const IN_ARG = (name: string) => `in__arg__${name}`;
const OUT_TERM = "out__term";

async function resolveTarget(ctx: any, kartenId: string, nodeId: string, handleId: string): Promise<PullResult> {
  return ctx.resolveInput({ kartenId, nodeId, targetHandleId: handleId });
}

export const computeAuswertung: ComputeFn = async (ctx, { kartenId, nodeId, outHandleId }) => {
  const d = ctx.getNodeData<any>(kartenId, nodeId);
  if (!d) return { ok: false, error: "keine Daten" };
  const eingangsTyp = d.eingangsTyp as DatenTypen;
  const schnittstellen = (d.schnittstellen ?? []) as Array<{ id: string; datentyp: DatenTypen }>;
  const hatVariablen = !!d.hatVariablen;

  // 1) Primäre Eingänge sammeln
  let primary: PullResult | undefined;
  let args: PullResult[] = [];
  if (eingangsTyp !== DatenTypen.Term) {
    primary = await resolveTarget(ctx, kartenId, nodeId, IN_BASE);
    if (!primary.ok) return { ok: false, error: "Primäreingang fehlt" };
  } else {
    // Term: Argumente in fester Reihenfolge (aus build-Ausgabe)
    const argNames: string[] = (d.argVariablenNamen ?? []).slice();
    args = await Promise.all(argNames.map(n => resolveTarget(ctx, kartenId, nodeId, IN_ARG(n))));
    if (args.some(r => !r.ok)) return { ok: false, error: "Argument-Eingang fehlt" };
  }

  // 2) Schnittstellen-Eingänge sammeln (optional, aber wenn definiert, sollten sie konkret sein)
  const schnittVals = await Promise.all(
    schnittstellen.map(s => resolveTarget(ctx, kartenId, nodeId, IN_SCHNITT(s.id)))
  );
  if (schnittVals.some(r => !r.ok)) {
    // solange nicht alle Schnittstellen definiert sind, rechnen wir nicht numerisch
    if (hatVariablen) {
      // gib Term aus, damit downstream weiterkommt
      return { ok: true, data: { dtype: "term", value: { kind: "call", op: "f", args: [] } } };
    }
    return { ok: false, error: "Schnittstellen unvollständig" };
  }

  // 3) Wenn Variablen im Upstream → Term generieren
  if (hatVariablen || eingangsTyp === DatenTypen.Term) {
    // baue symbolischen Term; in echt würdest du hier deinen Term-Baum aus primary/args/schnittVals zusammensetzen
    const term = { kind: "call", op: "f", args: [] as any[] };
    return { ok: true, data: { dtype: "term", value: term } };
  }

  // 4) Alles konkret → CAS auswerten (Stub: wir tun so, als wäre primary bereits das Ergebnis)
  // TODO: echten Worker callen, Ausdruck evaluieren
  if (primary) return primary;

  // Fallback
  return { ok: false, error: "keine Auswertung möglich" };
};
