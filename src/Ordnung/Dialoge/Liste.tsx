/// ./src/Ordnung/Dialoge/Liste.tsx

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CaretSortIcon, TrashIcon } from "@radix-ui/react-icons";
import { DatenTypen } from "@/Atlas/Anschlüsse.types";

const dtypeOrder: Record<DatenTypen, number> = {
  [DatenTypen.Unbekannt]: 0,
  [DatenTypen.Logik]: 1,
  [DatenTypen.Menge]: 2,
  [DatenTypen.Zahl]: 3,
};

export type ListItem = {
  id: string;
  title: string;
  dtype?: DatenTypen;
  metaRight?: React.ReactNode; // optionaler Zusatz rechts
};

export type ListGroup = {
  label: string;
  items: ListItem[];
  defaultOpen?: boolean;
};

export function Liste({
  title,
  groups,
  onRemove,
  emptyText,
}: {
  title?: string;
  groups: ListGroup[];
  onRemove?: (id: string) => void;
  emptyText: string;
}) {
  const allEmpty = groups.every(g => g.items.length === 0);

  return (
    <div className="flex flex-col gap-3">
      {title ? <h3 className="font-semibold">{title}</h3> : null}
      {allEmpty ? (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        groups.map((g, gi) => {
          // Sortieren nach Datentyp, dann Titel
          const sorted = [...g.items].sort((a, b) => {
            const da = a.dtype ?? DatenTypen.Unbekannt;
            const db = b.dtype ?? DatenTypen.Unbekannt;
            const d = dtypeOrder[da] - dtypeOrder[db];
            if (d !== 0) return d;
            return a.title.localeCompare(b.title, "de");
          });

          return (
            <Collapsible key={gi} defaultOpen={g.defaultOpen ?? true} className="border rounded-md">
              <div className="flex items-center justify-between px-3 py-2">
                <div className="font-medium">{g.label} ({g.items.length})</div>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <CaretSortIcon />
                    <span className="sr-only">Toggle</span>
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
                {sorted.map((item, i) => {
                  const prev = i > 0 ? sorted[i - 1] : null;
                  const showGap =
                    !!prev &&
                    (prev.dtype ?? DatenTypen.Unbekannt) !== (item.dtype ?? DatenTypen.Unbekannt);

                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between px-3 py-2 border-t ${showGap ? "mt-2 pt-3" : ""}`}
                    >
                      <div className="flex items-center gap-2">
                        {item.dtype && (
                          <Badge variant="outline">{item.dtype}</Badge>
                        )}
                        <div className="font-medium">{item.title}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.metaRight}
                        {onRemove && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onRemove(item.id)}
                            aria-label="Löschen"
                          >
                            <TrashIcon />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          );
        })
      )}
    </div>
  );
}
