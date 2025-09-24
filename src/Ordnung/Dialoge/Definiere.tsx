/// ./src/Ordnung/Dialoge/Definiere.tsx

import * as React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type FieldText = {
  kind: "text";
  key: string;
  label: string;
  placeholder?: string;
};

export type FieldSelect = {
  kind: "select";
  key: string;
  label: string;
  placeholder?: string;
  options: [string, any][];
};

export type DefiniereProps<T extends Record<string, any>> = {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  fields: (FieldText | FieldSelect)[];
  initial: T;
  validate?: (state: T) => string | null; // Fehlermeldung oder null
  onSubmit: (state: T, close: () => void, reset: () => void) => void;
};

export function Definiere<T extends Record<string, any>>(props: DefiniereProps<T>) {
  const { trigger, title, description, fields, initial, validate, onSubmit } = props;
  const [open, setOpen] = React.useState(false);
  const [state, setState] = React.useState<T>(initial);
  const [error, setError] = React.useState<string | null>(null);

  function reset() {
    setState(initial);
    setError(null);
  }

  function close() {
    setOpen(false);
  }

  function handleSubmit() {
    const msg = validate ? validate(state) : null;
    if (msg) { setError(msg); return; }
    onSubmit(state, close, reset);
  }

  function setValue(key: string, val: any) {
    setState(s => ({ ...s, [key]: val }));
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {fields.map(f => {
            if (f.kind === "text") {
              return (
                <div key={f.key} className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor={f.key} className="text-right">{f.label}</Label>
                  <Input
                    id={f.key}
                    className="col-span-3"
                    value={state[f.key] ?? ""}
                    placeholder={f.placeholder}
                    onChange={e => setValue(f.key, e.target.value)}
                  />
                </div>
              );
            }
            return (
              <div key={f.key} className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">{f.label}</Label>
                <Select
                  value={
                    f.options.find(([_, v]) => v === state[f.key])?.[0] ??
                    (state[f.key] ? String(state[f.key]) : undefined)
                  }
                  onValueChange={(name) => {
                    const found = f.options.find(([n]) => n === name)?.[1];
                    setValue(f.key, found);
                  }}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={f.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {f.options.map(([name]) => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          })}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit}>Hinzufügen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
