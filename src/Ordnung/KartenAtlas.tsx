import React from "react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel,
  SidebarGroupAction, SidebarGroupContent, SidebarHeader,
} from "@/components/ui/sidebar";
import { useKartenStore } from "@/Ordnung/DatenBank/KartenStore.ts";
import BenutzerFußleiste from "@/Ordnung/Benutzer/Benutzer.tsx";
import { type Bibliothek } from "@/Ordnung/programm.types.ts";
import { knotenBibliothek } from "@/Atlas/Karten/KartenVorlage.ts";

// RADIX Icons statt Lucide
import {
  PlusIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
} from "@radix-ui/react-icons";

export default function KartenAtlas(): React.ReactElement {
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

  // Platzhalter für öffentliche Karten, aktuell leer
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
        <KnotenBibliothek />
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

function KnotenBibliothek() {
  const oeffneKarte = useKartenStore(s => s.oeffneBibliotheksKarte);
  const items = Object.values(knotenBibliothek).map(karte => ({
    id: karte.id,
    label: karte.name,
    onClick: () => oeffneKarte(karte.id,karte.name), //karte.name),
  }));

  return (
    <BibliothekEinheit
      label="Knoten Bibliotheken"
      action="Bibliothek hinzufügen"
    >
      <GroupList items={items} />
    </BibliothekEinheit>
  );
}
