/// ./src/Ordnung/Dialoge.types.ts

import { KartenDefinition } from "@/Atlas/Karten.types";

type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";

export interface BestätigungsDialogArgumente {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title: string;
    description: string; // \n werden unterstützt
    confirmLabel?: string;
    confirmVariant?: ButtonVariant;
    cancelLabel?: string;
}
  

export interface AnmeldeDialogArgumente {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export type ListenAktion = {
    name: string;
    onSelect?: (e: Event) => void;
    disabled?: boolean;
    subAktionen?: ListenAktion[];
    separatorBefore?: boolean;
  };
  
  export type ModusVerwaltungsArgumente = {
    mode?: "manage";
    onRename?: (id: string, newName: string) => void;
    onDelete?: (id: string) => void; // generische Aktion hinter Trash-Icon
    isDeleteDisabled?: (id: string) => boolean;
    buildConfirmDialogContent?: (item: { id: string; name: string }) => {
      title: string;
      description?: string;
      confirmLabel?: string;
      confirmVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
      cancelLabel?: string;
    };
  };
  
  export type ModusAuswählenArgumente = {
    mode: "pick";
    onPick: (id: string) => void;
  };
  
  export type ListenDialogArgumente = {
    open: boolean;
    title: string;
    onClose: () => void;
    items: KartenDefinition[];
    aktionen?: ListenAktion[];
    headerActions?: React.ReactNode;
    description?: string;
  } & (ModusVerwaltungsArgumente | ModusAuswählenArgumente);
  