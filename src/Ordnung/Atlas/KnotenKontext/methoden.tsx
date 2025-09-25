/// ./src/Ordnung/Atlas/KnotenKontext/methoden.tsx

import { Position } from "@xyflow/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

import { AnschlussNachSeite, DatenTypen, Fluß, Variante } from "@/Atlas/Anschlüsse.types";
import { KontextAtlasArgumente } from "@/Ordnung/Atlas.types";

import { maxFälle } from "@/Atlas/Knoten/LogikKnoten";


export default function KontextAtlas(argumente: KontextAtlasArgumente) {
  const { überschrift, beschreibung, children } = argumente;

  function Beschreibung() {
    if (beschreibung) {
        return <CardDescription>{beschreibung}</CardDescription>
    }
  }
  function Inhalt() {
    if (children) {
        return <CardContent className="space-y-3">{children}</CardContent>
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{überschrift}</CardTitle>
        <Beschreibung />
      </CardHeader>
      <Inhalt />
    </Card>
  );
}


export function buildLogikAnschluesse(inputCount: number): AnschlussNachSeite {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const count = Math.max(0, Math.min(maxFälle, inputCount | 0));

  const left = Array.from({ length: count }, (_, i) => {
    let label: string;

    if (alphabet.length >= count) {
      // Einfach Buchstaben bis maxFälle
      label = alphabet[i];
    } else {
      label = `A${i + 1}`;
    }

    return {
      id: label,
      name: label,
      dtype: DatenTypen.Logik,
      fluss: Fluß.Eingang,
      variante: Variante.Einzel,
    };
  });

  const top = [
    {
      id: "Out",
      name: "Out",
      dtype: DatenTypen.Logik,
      fluss: Fluß.Ausgang,
      variante: Variante.Einzel,
    },
  ];

  return {
    [Position.Bottom]: left,
    [Position.Top]: top,
  };
}

// erzeugt 2^n Zeilen
export function erzeugePermutationen(n: number): boolean[][] {
  if (n <= 0) return [[]];
  const perms: boolean[][] = [];
  const rows = 1 << n;
  for (let i = 0; i < rows; i++) {
    const zeile: boolean[] = [];
    for (let j = n - 1; j >= 0; j--) {
      zeile.push(((i >> j) & 1) === 0);
    }
    perms.push(zeile);
  }
  return perms;
}
