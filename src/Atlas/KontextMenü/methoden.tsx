// ./src/Atlas/KontextMenü/methoden.tsx

import React from "react";


// ./src/Atlas/KontextMenü/methoden.tsx
export function Shell({ style, children }: { style: React.CSSProperties; children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;

      // Wenn irgendein Radix-Dialog offen ist: NICHT schließen
      // Das deckt alle shadcn/Radix Dialoge ab, auch wenn data-Attribute variieren.
      const anyDialogOpen =
        document.querySelector('[data-radix-portal] [role="dialog"][data-state="open"]') ||
        document.querySelector('[data-radix-dialog-content][data-state="open"]');

      if (anyDialogOpen) {
        return;
      }

      if (ref.current && target && !ref.current.contains(target)) {
        // @ts-expect-error: child kann onClose besitzen
        children?.props?.onClose?.();
      }
    };

    // WICHTIG: bubble-Phase benutzen, nicht capture
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
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
    type="button"
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
