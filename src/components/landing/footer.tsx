import Link from "next/link";

const cols = [
  {
    title: "Product",
    links: [
      { label: "Isolation", href: "#isolation" },
      { label: "Roles", href: "#roles" },
      { label: "Capabilities", href: "#capabilities" },
      { label: "Security", href: "#trust" },
    ],
  },
  {
    title: "Get started",
    links: [
      { label: "Register your college", href: "/register" },
      { label: "Log in", href: "/login" },
      { label: "FAQ", href: "#faq" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-md bg-ink text-sm font-bold text-white">
                S
              </span>
              <span className="font-display text-[15px] font-bold tracking-tight">
                Smart Campus
              </span>
            </div>
            <p className="mt-4 max-w-xs text-[13.5px] leading-relaxed text-body">
              One app, many colleges, fully isolated. Run your campus&apos;s
              notices, timetable, attendance, assignments, and notes from a single
              workspace.
            </p>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <p className="font-mono text-[11px] uppercase tracking-wide text-faint">
                {col.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="rounded text-[13.5px] text-body transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-vermillion"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-line pt-6 sm:flex-row sm:items-center">
          <p className="font-mono text-[12px] text-faint">
            © {new Date().getFullYear()} Smart Campus
          </p>
          <p className="font-mono text-[12px] text-faint">
            Multi-tenant by design · server-enforced isolation
          </p>
        </div>
      </div>
    </footer>
  );
}
