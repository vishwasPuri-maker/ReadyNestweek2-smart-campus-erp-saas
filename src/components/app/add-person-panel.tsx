"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { AddPersonForm } from "./add-person-form";

/**
 * "Add person" trigger + a smoothly animated collapsible form. Height animates via
 * grid-template-rows 0fr→1fr (no fixed max-height guessing), with opacity + an
 * ease-out-expo curve. Reduced-motion users get an instant toggle.
 */
export function AddPersonPanel({
  label = "Add person",
}: {
  label?: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="inline-flex h-11 items-center gap-2 rounded-lg bg-vermillion px-5 text-[14px] font-semibold text-white shadow-soft transition-colors hover:bg-vermillion-press focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vermillion"
      >
        <Plus
          className={cn(
            "size-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
            open && "rotate-[135deg]"
          )}
        />
        {open ? "Close" : label}
      </button>

      <div
        className={cn(
          "grid transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
          open ? "mt-5 grid-rows-[1fr] opacity-100" : "mt-0 grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="rounded-2xl border border-line bg-paper p-6">
            <AddPersonForm onDone={() => setOpen(false)} />
          </div>
        </div>
      </div>
    </div>
  );
}
