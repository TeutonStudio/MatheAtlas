// ./src/Atlas/KontextMenü/methoden.tsx

import React from "react";

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
