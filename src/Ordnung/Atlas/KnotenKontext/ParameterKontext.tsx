/// ./src/Ordnung/Atlas/KnotenKontext/ParameterKontext.tsx

import { ParameterKnotenDaten } from "@/Atlas/Knoten.types";
import KontextAtlas from "./methoden";
import { useKartenStore } from "@/Ordnung/DatenBank/KartenStore";
import { DatenTypen } from "@/Atlas/Anschlüsse.types";

import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const MENGETYPEN = [
  { value: "leer", label: "Leere Menge (∅)" },
  { value: "N",    label: "Natürliche (ℕ)" },
  { value: "Z",    label: "Ganze (ℤ)" },
  { value: "Q",    label: "Rationale (ℚ)" },
  { value: "R",    label: "Reelle (ℝ)" },
  { value: "C",    label: "Komplexe (ℂ)" },
] as const;

export default function ParameterKontext({ id, data }: { id: string; data: ParameterKnotenDaten }) {
  const updateNodeData = useKartenStore(s => s.updateNodeData);
  const revalidate = useKartenStore(s => s.revalidateEdgesForNode);

  function setDtype(dtype: DatenTypen) {
    updateNodeData(id, prev => {
      let wert: any = prev.wert;
      if (dtype === DatenTypen.Logik) wert = "lüge";
      else if (dtype === DatenTypen.Menge) wert = "leer";
      else if (dtype === DatenTypen.Zahl) wert = 0;
      return { ...prev, dtype, wert };
    });
    revalidate(id);
  }

  function setWert(wert: any) {
    updateNodeData(id, prev => ({ ...prev, wert }));
    // dtype bleibt gleich -> keine Revalidation nötig
  }

  // Nur erlaubte Typen anzeigen
  const erlaubteTypen: { value: DatenTypen; label: string }[] = [
    { value: DatenTypen.Logik, label: "Logik" },
    { value: DatenTypen.Menge, label: "Menge" },
    { value: DatenTypen.Zahl,  label: "Zahl"  },
  ];

  function WertFeld() {
    switch (data.dtype) {
      case DatenTypen.Logik:
        return (
          <Select value={String(data.wert ?? "lüge")} onValueChange={v => setWert(v)}>
            <SelectTrigger><SelectValue placeholder="Wert wählen" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="wahr">wahr</SelectItem>
              <SelectItem value="lüge">lüge</SelectItem>
            </SelectContent>
          </Select>
        );

      case DatenTypen.Menge:
        return (
          <Select value={String(data.wert ?? "leer")} onValueChange={v => setWert(v)}>
            <SelectTrigger><SelectValue placeholder="Menge wählen" /></SelectTrigger>
            <SelectContent>
              {MENGETYPEN.map(m => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case DatenTypen.Zahl:
        return (
          <Input
            type="number"
            value={Number.isFinite(Number(data.wert)) ? String(data.wert) : "0"}
            onChange={e => setWert(e.target.value === "" ? 0 : Number(e.target.value))}
          />
        );

      default:
        return <div className="text-sm text-muted-foreground">Unzulässiger Typ</div>;
    }
  }

  return (
    <KontextAtlas
      überschrift={data.title ?? "Parameter"}
      beschreibung={"Parameter definieren Datentyp und Wert.\nDie Darstellung im Knoten erfolgt automatisch als LaTeX."}
    >
      <div className="grid grid-cols-2 items-center gap-2">
        <Label>Datentyp</Label>
        <Select value={data.dtype} onValueChange={v => setDtype(v as DatenTypen)}>
          <SelectTrigger><SelectValue placeholder="Typ wählen" /></SelectTrigger>
          <SelectContent>
            {erlaubteTypen.map(t => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Label>Wert</Label>
        <WertFeld />
      </div>
    </KontextAtlas>
  );
}
