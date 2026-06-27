import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        data-slot="select"
        className={cn(
          "h-11 w-full appearance-none rounded-lg border border-line bg-surface pl-3.5 pr-9 text-[15px] text-ink outline-none transition-[color,box-shadow,border-color]",
          "focus-visible:border-vermillion focus-visible:ring-[3px] focus-visible:ring-vermillion/20",
          "aria-[invalid=true]:border-destructive disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-faint" />
    </div>
  );
}

export { Select };
