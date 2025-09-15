// ./src/Atlas/Karten/KontextMenüKomponenten.tsx

import React, { useEffect, useRef, useState } from "react";
import { type XYPosition, type EdgeChange } from "@xyflow/react";
import { Dialog, DialogTrigger } from '@/components/ui/dialog';

import { type Lebensraum } from "@/Atlas/Karten.types.ts";

import InstanzierbareKnotenDialogContent from './InstanzierbareKnotenDialog';
import { useKartenStore } from "@/Ordnung/DatenBank/KartenStore";

export function Shell({ style, children }: { style: React.CSSProperties; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        // @ts-expect-error: The child component will have the onClose prop.
        children?.props?.onClose?.();
      }
    };
    window.addEventListener("mousedown", onDown, true);
    return () => window.removeEventListener("mousedown", onDown, true);
  }, [children]);

  return (
    <div ref={ref} style={style} className="rounded-xl border bg-popover p-2 shadow-lg">
      {children}
    </div>
  );
}

export const Item = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { onSelect?: () => void }
>(({ children, onSelect, ...props }, ref) => (
  <button
    ref={ref}
    {...props}
    onClick={(e) => {
      props.onClick?.(e);
      onSelect?.();
    }}
    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
  >
    {children}
  </button>
));
Item.displayName = "Item";

export function PaneItems({ onClose, scope, position }: { onClose?: () => void, scope: Lebensraum, position: XYPosition }) {
  const [open, setOpen] = useState(false);
  const aktiveKarteId = useKartenStore(s => s.aktiveKarteId);
  const findKarte = useKartenStore(s => s.findKarte);
  const geöffnet = useKartenStore(s => s.geöffnet);

  const logKartenDefinition = () => {
    if (aktiveKarteId) {
      const kartenDefinition = findKarte(aktiveKarteId);
      const geöffneteKarte = geöffnet[aktiveKarteId];
      console.log("--- Aktive Karte Definition ---");
      console.log("DB Definition:", kartenDefinition);
      console.log("Geöffnete Karte (Live-Zustand):", geöffneteKarte);
      console.log("---------------------------------");
      onClose?.();
    }
  };

  return (
    <div className="min-w-44">
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) onClose?.();
        }}
      ><NeuerKnoten open={open} setOpen={setOpen} scope={scope} position={position} /></Dialog>

      <Item onSelect={onClose}>Einfügen</Item>
      <Item onSelect={onClose}>Exportieren</Item>
      <Item onSelect={logKartenDefinition}>Karten-Definition loggen</Item>
    </div>
  );
}


function NeuerKnoten({open, setOpen, scope, position}:{
  open: boolean; 
  setOpen: (open: boolean) => void;
  scope: Lebensraum; 
  position: XYPosition;
}) {
  function onClick(e:React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  };
  function onClose() {
    setOpen(false);
  }
  if (scope !== "defined") {
    return (
      <>
        <DialogTrigger asChild>
          <Item onClick={onClick} >
            Neuer Knoten
          </Item>
        </DialogTrigger>

        {open && (
          <InstanzierbareKnotenDialogContent
            position={position}
            onClose={onClose}
          />
        )}
      </>
    )
  }
}



export function NodeItems({ id, onClose }: { id?: string; onClose?: () => void }) {
  const oeffneUmbenennenDialog = useKartenStore(s => s.oeffneUmbenennenDialog)
  return (
    <div className="min-w-44">
      <Item onSelect={() => {
        if (id) oeffneUmbenennenDialog(id)
        onClose?.()
      }}>Knoten umbenennen</Item>
      <Item onSelect={onClose}>Knoten duplizieren</Item>
      <Item onSelect={onClose}>Knoten löschen</Item>
      <Item onSelect={onClose}>Als Vorlage speichern</Item>
      <div className="px-3 pt-1 text-xs opacity-60">ID: {id}</div>
    </div>
  );
}

export function EdgeItems({ id, onClose }: { id?: string; onClose?: () => void }) {
  const onEdgesChange = useKartenStore((s) => s.onEdgesChange);

  return (
    <div className="min-w-44">
      <LöscheEdge id={id} scope="defined" onEdgesChange={onEdgesChange} onClose={onClose} />
      <Item onSelect={onClose}>Stil ändern</Item>
      <div className="px-3 pt-1 text-xs opacity-60">ID: {id}</div>
    </div>
  );
}

function LöscheEdge({id,scope,onEdgesChange,onClose}:{
  id?:string;
  scope:Lebensraum;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onClose?: () => void;
}) {
  if (scope !== "defined") {
    return (
      <Item onSelect={() => {
        if (id) {
          const changes: EdgeChange[] = [{ type: 'remove', id: id }];
          onEdgesChange(changes);
        }
        onClose?.();
      }}>Verbindung löschen</Item>
    )
  }
}
