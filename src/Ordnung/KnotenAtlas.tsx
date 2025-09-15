// ./src/Ordnung/KnotenAtlas.

 import React, { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { KNOTEN, Lebensraum } from "@/Atlas/Karten.types.ts";

import { useKartenStore } from "./DatenBank/KartenStore";
import { SchnittstelleDialog } from "./SchnittstelleDialog.tsx";
import { SchnittstellenListe } from "./SchnittstellenListe.tsx";

export default function KnotenAtlas() {
  const { aktiveKarteId, findKarte, geöffnet } = useKartenStore();

  const aktiveKarte = aktiveKarteId ? findKarte(aktiveKarteId) : null;
  const offeneKarte = aktiveKarteId ? geöffnet[aktiveKarteId] : undefined;
  const scope = (aktiveKarte?.scope === offeneKarte?.scope && aktiveKarte) ? aktiveKarte.scope : undefined;

  const schnittstellenKnoten = useMemo(() => {
    if (!offeneKarte) return [];
    return offeneKarte.nodes.filter((n) => n.type === KNOTEN.Schnittstelle);
  }, [offeneKarte]);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Schnittstellen</CardTitle>
        <Beschreibung scope={scope} />
      </CardHeader>
      <Inhalt
        aktiveKarteId={aktiveKarteId}
        offeneKarte={offeneKarte}
        schnittstellenKnoten={schnittstellenKnoten}
        scope={scope}
      />
    </Card>
  );
}

function Beschreibung({scope}:{scope:Lebensraum | undefined}) {
  const text = "Verwalte die Ein- und Ausgänge deiner Karte.";
  return (
    <CardDescription>
      {text}
    </CardDescription>
  )
}

function Inhalt({aktiveKarteId, offeneKarte, schnittstellenKnoten, scope}:{
  aktiveKarteId: string | null;
  offeneKarte: any | undefined;
  schnittstellenKnoten: any;
  scope: Lebensraum | undefined;
}) {
  function Definieren() {
    if (scope !== "defined") {
      return (
        <SchnittstelleDialog
          aktiveKarteId={aktiveKarteId}
          offeneKarte={offeneKarte}
        >
          <Button className="w-full">Schnittstelle definieren</Button>
        </SchnittstelleDialog>
      )
    }
  }

  if(aktiveKarteId && offeneKarte) {
    return (
      <CardContent>
        <Definieren />
        <SchnittstellenListe
          aktiveKarteId={aktiveKarteId!}
          schnittstellenKnoten={schnittstellenKnoten}
        />
      </CardContent>
    )
  } else { return (<></>) }
}
