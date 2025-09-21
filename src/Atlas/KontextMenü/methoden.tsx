// ./src/Atlas/KontextMenü/methoden.tsx

import React, { useEffect, useRef, useState } from "react";


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
