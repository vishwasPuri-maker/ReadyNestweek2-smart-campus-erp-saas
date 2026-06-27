const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const ORDER = [1, 2, 3, 4, 5, 6, 0];

type Entry = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  subject: string;
  room: string | null;
};

export function TimetableView({
  entries,
  highlightDay,
}: {
  entries: Entry[];
  highlightDay?: number;
}) {
  if (entries.length === 0) {
    return (
      <p className="border-t border-line py-10 text-[14px] text-faint">
        No classes scheduled yet.
      </p>
    );
  }

  const byDay = ORDER.map((d) => ({
    d,
    items: entries
      .filter((e) => e.dayOfWeek === d)
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-6">
      {byDay.map((g) => (
        <div key={g.d}>
          <p className="mb-2 flex items-center gap-2 font-mono text-[12px] uppercase tracking-wide text-faint">
            {DAY_NAMES[g.d]}
            {g.d === highlightDay && (
              <span className="rounded-full bg-vermillion px-1.5 py-0.5 text-[9.5px] font-semibold text-white">
                Today
              </span>
            )}
          </p>
          <ul className="space-y-2">
            {g.items.map((e, i) => (
              <li
                key={i}
                className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3 shadow-soft"
              >
                <span className="shrink-0 rounded-lg bg-paper px-2.5 py-1.5 text-center font-mono text-[11.5px] leading-tight text-body">
                  {e.startTime}
                  <span className="block text-faint">{e.endTime}</span>
                </span>
                <span className="flex-1 text-[14.5px] font-semibold text-ink">{e.subject}</span>
                {e.room && (
                  <span className="shrink-0 rounded-full border border-line px-2.5 py-0.5 text-[11.5px] text-faint">
                    {e.room}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
