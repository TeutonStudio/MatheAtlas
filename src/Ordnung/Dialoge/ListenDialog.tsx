/// ./src/Ordnung/Dialoge/ListenDialog.tsx

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Menubar,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
  MenubarSeparator,
} from "@/components/ui/menubar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrashIcon, Pencil1Icon, CheckIcon, Cross2Icon } from "@radix-ui/react-icons";
import { toast } from "sonner";
import { cn } from "@/lib/utils"; // falls nicht vorhanden, entfernen
import { KartenDefinition } from "@/Atlas/Karten.types";
import { BestaetigungsDialog } from "@/Ordnung/Dialoge/BestätigungsDialog";
import { type ListenAktion, type ListenDialogArgumente } from "../dialoge.types";


/* -------------------- Komponente -------------------- */

export function ListenDialog(props: ListenDialogArgumente) {
  const {
    open,
    title,
    onClose,
    items,
    aktionen = [],
    headerActions,
    description,
  } = props;

  const descText = description ?? "Listendialog";

  const [renameId, setRenameId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [pendingItem, setPendingItem] = useState<{ id: string; name: string } | null>(null);

  /* ---------- Rename ---------- */
  function startRename(id: string, currentName: string) {
    if (props.mode === "pick") return;
    setRenameId(id);
    setNewName(currentName);
  }
  function confirmRename() {
    if (props.mode === "pick") return;
    if (!renameId) return;
    const trimmed = newName.trim();
    if (!trimmed) {
      toast.error("Der Name darf nicht leer sein.");
      return;
    }
    props.onRename?.(renameId, trimmed);
    setRenameId(null);
    setNewName("");
    toast.success("Eintrag umbenannt.");
  }
  function cancelRename() {
    if (props.mode === "pick") return;
    setRenameId(null);
    setNewName("");
  }

  /* ---------- Aktion hinter Trash-Icon ---------- */
  function requestAction(id: string, name: string) {
    if (props.mode === "pick") return;
    if (props.buildConfirmDialogContent) {
      setPendingItem({ id, name });
    } else {
      props.onDelete?.(id);
    }
  }
  function confirmAction() {
    if (props.mode === "pick") return;
    if (!pendingItem) return;
    try {
      props.onDelete?.(pendingItem.id);
    } finally {
      setPendingItem(null);
    }
  }

  const isDeleteDisabled = (id: string) => {
    if (props.mode === "pick") return true;
    return props.isDeleteDisabled?.(id) ?? false;
  };

  const confirmContent =
    pendingItem && props.mode !== "pick" && props.buildConfirmDialogContent
      ? props.buildConfirmDialogContent(pendingItem)
      : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className={cn(description ? "" : "sr-only")}>
            {descText}
          </DialogDescription>
        </DialogHeader>

        {headerActions ? (
          <div className="flex justify-end gap-2 pb-2">{headerActions}</div>
        ) : null}

        {aktionen.length > 0 ? <AktionsLeiste aktionen={aktionen} /> : null}

        <div className="mt-2 rounded-xl border bg-secondary ring-1 ring-inset ring-border shadow-inner">
          <ScrollArea className="h-72">
            {props.mode === "pick" ? (
              <PickListe items={items} onPick={(id:string) => {props.onPick(id); /*console.log(id,"wurde ausgewählt")*/}} />
            ) : (
              <ManageListe
                items={items}
                renameId={renameId}
                newName={newName}
                onNewName={setNewName}
                onConfirmRename={confirmRename}
                onCancelRename={cancelRename}
                onStartRename={startRename}
                onRequestDelete={requestAction}
                isDeleteDisabled={isDeleteDisabled}
              />
            )}
          </ScrollArea>
        </div>

        {confirmContent && pendingItem ? (
          <BestaetigungsDialog
            open={true}
            onOpenChange={(o) => !o && setPendingItem(null)}
            onConfirm={confirmAction}
            title={confirmContent.title}
            description={confirmContent.description ?? ""}
            confirmLabel={confirmContent.confirmLabel}
            confirmVariant={confirmContent.confirmVariant}
            cancelLabel={confirmContent.cancelLabel}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

/* -------------------- Unterkomponenten -------------------- */

function ManageListe(props: {
  items: KartenDefinition[];
  renameId: string | null;
  newName: string;
  onNewName: (v: string) => void;
  onConfirmRename: () => void;
  onCancelRename: () => void;
  onStartRename: (id: string, currentName: string) => void;
  onRequestDelete: (id: string, name: string) => void;
  isDeleteDisabled: (id: string) => boolean;
}) {
  const rowClass = "flex items-center justify-between gap-3 px-4 py-2";
  return (
    <div className="py-2">
      {props.items.map(karte => (
        <div key={karte.id} className={rowClass}>
          {props.renameId === karte.id ? (
            <UmbennenLeiste
              value={props.newName}
              onChange={props.onNewName}
              onConfirm={props.onConfirmRename}
              onCancel={props.onCancelRename}
            />
          ) : (
            <StandardLeiste
              name={karte.name}
              onRename={() => props.onStartRename(karte.id, karte.name)}
              onDelete={() => props.onRequestDelete(karte.id, karte.name)}
              deleteDisabled={props.isDeleteDisabled(karte.id)}
              deleteTitle={
                props.isDeleteDisabled(karte.id)
                  ? "Eintrag wird in anderen Karten verwendet."
                  : "Aktion ausführen"
              }
            />
          )}
        </div>
      ))}
    </div>
  );
}

function PickListe(props: { items: KartenDefinition[]; onPick: (id: string) => void }) {
  return (
    <div className="py-2">
      {props.items.map(karte => (
        <button
          type="button"
          key={karte.id}
          onClick={(e) => {
            console.log("Knoten ausgewählt")
            props.onPick(karte.id)
          }}
          className="group flex w-full items-center justify-between px-4 py-2 hover:bg-accent rounded-md text-left"
        >
          <span>{karte.name}</span>
          <CheckIcon className="h-4 w-4 opacity-0 group-hover:opacity-100" />
        </button>
      ))}
    </div>
  );
}

function StandardLeiste(props: {
  name: string;
  onRename: () => void;
  onDelete: () => void;
  deleteDisabled?: boolean;
  deleteTitle?: string;
}) {
  return (
    <>
      <span className="truncate">{props.name}</span>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={props.onRename}>
          <Pencil1Icon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          disabled={props.deleteDisabled}
          onClick={props.onDelete}
          title={props.deleteTitle}
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
        <div className="w-1" />
      </div>
    </>
  );
}

function UmbennenLeiste(props: {
  value: string;
  onChange: (v: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") props.onConfirm();
    if (e.key === "Escape") props.onCancel();
  }
  return (
    <>
      <Input
        value={props.value}
        onChange={e => props.onChange(e.target.value)}
        onKeyDown={onKeyDown}
        autoFocus
      />
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={props.onConfirm}>
          <CheckIcon className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={props.onCancel}>
          <Cross2Icon className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}

/* -------------------- Menü-Rendering -------------------- */

function keyFromPath(path: number[]) {
  return path.join("-");
}

function RenderSubAktionen({ items, path }: { items: ListenAktion[]; path: number[] }) {
  return (
    <>
      {items.map((aktion, i) => {
        const p = [...path, i];
        const key = keyFromPath(p);

        const content = (
          <>
            {aktion.separatorBefore ? <MenubarSeparator /> : null}
            {aktion.subAktionen && aktion.subAktionen.length > 0 ? (
              <MenubarSub key={key}>
                <MenubarSubTrigger disabled={aktion.disabled}>{aktion.name}</MenubarSubTrigger>
                <MenubarSubContent>
                  <RenderSubAktionen items={aktion.subAktionen} path={p} />
                </MenubarSubContent>
              </MenubarSub>
            ) : (
              <MenubarItem
                key={key}
                disabled={aktion.disabled}
                onSelect={(e) => {
                  e.preventDefault();
                  aktion.onSelect?.(e);
                }}
              >
                {aktion.name}
              </MenubarItem>
            )}
          </>
        );

        return content;
      })}
    </>
  );
}

export function AktionsLeiste({ aktionen }: { aktionen: ListenAktion[] }) {
  return (
    <div className="pb-2">
      <Menubar>
        {aktionen.map((aktion, i) => {
          const key = keyFromPath([i]);
          if (aktion.subAktionen && aktion.subAktionen.length > 0) {
            return (
              <MenubarMenu key={key}>
                <MenubarTrigger disabled={aktion.disabled}>{aktion.name}</MenubarTrigger>
                <MenubarContent>
                  <RenderSubAktionen items={aktion.subAktionen} path={[i]} />
                </MenubarContent>
              </MenubarMenu>
            );
          }
          return (
            <MenubarMenu key={key}>
              <MenubarTrigger asChild>
                <MenubarItem
                  onSelect={(e) => {
                    e.preventDefault();
                    aktion.onSelect?.(e);
                  }}
                  disabled={aktion.disabled}
                >
                  {aktion.name}
                </MenubarItem>
              </MenubarTrigger>
            </MenubarMenu>
          );
        })}
      </Menubar>
    </div>
  );
}

export default ListenDialog;