import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-[90px] w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-[15px] text-ink outline-none transition-[color,box-shadow,border-color]",
        "placeholder:text-faint",
        "focus-visible:border-vermillion focus-visible:ring-[3px] focus-visible:ring-vermillion/20",
        "aria-[invalid=true]:border-destructive disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
