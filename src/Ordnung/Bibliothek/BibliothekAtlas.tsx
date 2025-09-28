/// ./src/Ordnung/Bibliothek/BibliothekAtlas.tsx

import React from "react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel,
  SidebarGroupAction, SidebarGroupContent, SidebarHeader,
} from "@/components/ui/sidebar";

import { useKartenStore } from "@/Ordnung/DatenBank/KartenStore.ts";
import BenutzerFußleiste from "@/Ordnung/Benutzer/Benutzer.tsx";
import { type Bibliothek } from "@/Ordnung/programm.types.ts";
import { knotenBibliothek } from "@/Atlas/Karten/Vorlagen/KartenVorlage";

// RADIX Icons statt Lucide
import {
  PlusIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
} from "@radix-ui/react-icons";


export default function BibliothekAtlas(): React.ReactElement {
  const db = useKartenStore(s => s.db);
  const currentUser = useKartenStore(s => s.currentUser);
  const oeffneKarte = useKartenStore(s => s.oeffneKarte);
  const erstelleNeueKarte = useKartenStore(s => s.erstelleNeueKarte);

  const privateKarten = Object.values(db)
    .filter(karte => karte.scope === "private" && karte.userId === currentUser?.id)
    .map(karte => ({
      id: karte.id,
      label: karte.name,
      onClick: () => oeffneKarte(karte.id, karte.name),
    }));

  const oeffentlicheKarten = Object.values(db)
    .filter(karte => karte.scope === "public")
    .map(karte => ({ 
      id: karte.id, 
      label: karte.name, 
      onClick: () => oeffneKarte(karte.id, karte.name) 
    }));


  return (
    <Sidebar className="atlas-sidebar" style={{ width: 280 }}>
      <SidebarHeader />
      <SidebarContent>
        <KartenBibliothek
          privateItems={privateKarten}
          publicItems={oeffentlicheKarten}
          onAdd={() => erstelleNeueKarte()}
        />
        {/*<KnotenBibliothek />*/}
      </SidebarContent>
      <SidebarFooter>
        <BenutzerFußleiste />
      </SidebarFooter>
    </Sidebar>
  );
}

function GroupList({ items }: { items: { id: string; label: string; onClick?: () => void }[] }) {
  if (!items?.length) {
    return <div className="text-muted-foreground px-3 py-2 text-sm">Keine Einträge</div>;
  }
  return (
    <ul className="px-2 py-1 space-y-1">
      {items.map(it => (
        <li key={it.id}>
          <button
            type="button"
            className="w-full text-left px-3 py-2 rounded-md hover:bg-accent"
            onClick={it.onClick}
          >
            {it.label}
          </button>
        </li>
      ))}
    </ul>
  );
}

function BibliothekEinheit(argumente: Bibliothek & {
  collapsible?: boolean; // neu: steuert Ein-/Ausklappen
}) {
  const { label, action, onAddMap, size = 16, children, collapsible = true } = argumente;
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <SidebarGroup>
      <div className="flex items-center">
        <SidebarGroupLabel>{label}</SidebarGroupLabel>
        <div className="flex-grow" />
        {onAddMap && (
          <SidebarGroupAction
            title={action || "Hinzufügen"}
            aria-label={action ?? "Hinzufügen"}
            onClick={onAddMap}
          >
            <PlusIcon width={size} height={size} />
            <span className="sr-only">{action || "Hinzufügen"}</span>
          </SidebarGroupAction>
        )}
        {collapsible && (
          <SidebarGroupAction
            title={isCollapsed ? "Ausklappen" : "Einklappen"}
            aria-label={isCollapsed ? "Ausklappen" : "Einklappen"}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed
              ? <ChevronLeftIcon width={size} height={size} />
              : <ChevronDownIcon width={size} height={size} />}
            <span className="sr-only">{isCollapsed ? "Ausklappen" : "Einklappen"}</span>
          </SidebarGroupAction>
        )}
      </div>

      {(!collapsible || !isCollapsed) && (
        <SidebarGroupContent>
          {children}
        </SidebarGroupContent>
      )}
    </SidebarGroup>
  );
}

function KartenBibliothek({
  privateItems,
  publicItems,
  onAdd,
}: {
  privateItems: { id: string; label: string; onClick?: () => void }[];
  publicItems: { id: string; label: string; onClick?: () => void }[];
  onAdd?: () => void;
}) {
  return (
    <BibliothekEinheit
      label="Karten Bibliotheken"
      action="Neue Karte erstellen"
      onAddMap={onAdd}
      collapsible={false} // wichtig: kein Pfeil hier, stattdessen nur Plus
    >
      <BibliothekEinheit
        label="Private Karten"
        action="Neue Karte erstellen"
      >
        <GroupList items={privateItems} />
      </BibliothekEinheit>

      <BibliothekEinheit
        label="Öffentliche Karten"
        action=""
      >
        <GroupList items={publicItems} />
      </BibliothekEinheit>
    </BibliothekEinheit>
  );
}


// Typsicher und nervenresistent

type BibliothekItem = {
  id: string;
  label: string;
  pfad: string[];           // z.B. ["Algebra", "Gleichungen", "Linear"]
  onClick: () => void;
};

// Knoten im Baum: hat eigene Items und benannte Untergruppen
export type KnotenGruppe = {
  _items: BibliothekItem[];
  _gruppen: Record<string, KnotenGruppe>;
};

/**
 * Baut aus einer flachen Liste einen verschachtelten Record nach `pfad`.
 * - ignoriert leere/whitespace Segmente
 * - unterstützt leere Pfade (Items landen auf Root-Ebene)
 * - keine Mutationen der Eingabe
 */
export function baueKnotenBaum(items: BibliothekItem[]): KnotenGruppe {
  const root: KnotenGruppe = { _items: [], _gruppen: {} };

  for (const it of items) {
    const segmente = Array.isArray(it.pfad) ? it.pfad : [];
    // normalize: trimmen + leere Segmente raus
    const norm = segmente.map(s => s?.trim()).filter(Boolean) as string[];

    let node = root;
    if (norm.length === 0) {
      node._items.push(it);
      continue;
    }

    for (const seg of norm) {
      node._gruppen[seg] ??= { _items: [], _gruppen: {} };
      node = node._gruppen[seg];
    }
    node._items.push(it);
  }

  return root;
}



function KnotenBibliothek() {
  const oeffneKarte = useKartenStore(s => s.oeffneBibliotheksKarte);

  // 1) Items aus der Bibliothek in strukturierte BibliothekItems umwandeln
  const items: BibliothekItem[] = Object.values(knotenBibliothek)
    .filter(karte => karte.scope === "defined")
    .map(karte => {
      // pfad z.B. "Knoten Bibliothek/Logik/logik-und-knoten"
      const segs = (karte.pfad ?? "").split("/").map(s => s.trim()).filter(Boolean);
      // erstes Segment ignorieren
      const segsOhneErstes = segs.slice(1);
      // letztes Segment ist der Name der Karte
      const label = segsOhneErstes.at(-1) ?? karte.name ?? "Unbenannt";
      // die mittleren Segmente bilden den Gruppenpfad
      const gruppenPfad = segsOhneErstes.slice(0, -1);

      return {
        id: karte.id,
        label,
        pfad: gruppenPfad,
        onClick: () => oeffneKarte(karte.id, label),
      } as BibliothekItem;
    });

  // 2) Baum konstruieren
  const baum = baueKnotenBaum(items);

  return (
    <BibliothekEinheit
      label="Knoten Bibliothek"
      action="Bibliothek hinzufügen"
    >
      <KnotenBaumGruppe gruppe={baum} ebene={0} />
    </BibliothekEinheit>
  );
}


function KnotenBaumGruppe({ gruppe, ebene, titel }: { gruppe: KnotenGruppe; ebene: number; titel?: string }) {
  // Gruppe-Header nur rendern, wenn es einen Titel gibt (Root hat keinen)
  const [offen, setOffen] = React.useState(true);

  const hatUntergruppen = Object.keys(gruppe._gruppen).length > 0;

  return (
    <div className="space-y-1">
      {titel ? (
        <div className="flex items-center px-2">
          <button
            type="button"
            className="flex items-center gap-1 text-sm font-medium px-2 py-1 rounded hover:bg-accent"
            style={{ paddingLeft: Math.max(0, (ebene - 1)) * 12 }}
            onClick={() => setOffen(v => !v)}
          >
            {offen ? <ChevronDownIcon width={16} height={16} /> : <ChevronLeftIcon width={16} height={16} />}
            <span>{titel}</span>
          </button>
        </div>
      ) : null}

      {(titel ? offen : true) && (
        <div className="space-y-1">
          {/* Items dieser Ebene */}
          {gruppe._items.length > 0 && (
            <ul className="px-2 space-y-1">
              {gruppe._items.map(it => (
                <li key={it.id}>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-accent"
                    style={{ paddingLeft: ebene * 16 }}
                    onClick={it.onClick}
                  >
                    {it.label}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Untergruppen rekursiv */}
          {hatUntergruppen && (
            <div className="space-y-1">
              {Object.entries(gruppe._gruppen).map(([name, sub]) => (
                <KnotenBaumGruppe key={name} gruppe={sub} ebene={ebene + 1} titel={name} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

