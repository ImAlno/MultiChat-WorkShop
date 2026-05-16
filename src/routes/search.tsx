import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { ThreadCard } from "@/components/ThreadCard";
import { threads } from "@/lib/mock-data";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search · Multichat" },
      {
        name: "description",
        content: "Search across all your conversations in natural language.",
      },
    ],
  }),
  component: SearchPage,
});

const SUGGESTIONS = [
  "Show deployment issues",
  "Unread important conversations",
  "Messages from Sofia",
  "Customer escalations today",
];

function SearchPage() {
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    return threads.filter((t) =>
      [t.title, t.summary, t.channel, t.participants.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [q]);

  return (
    <MobileShell>
      <header className="px-5 pt-8 pb-3">
        <h1 className="text-[24px] font-semibold tracking-tight">Search</h1>
        <p className="mt-1 text-[13.5px] text-muted-foreground">
          Ask in your own words. We'll quietly find the rest.
        </p>
      </header>

      <div className="px-5">
        <label className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-3.5 py-3 shadow-soft focus-within:ring-2 focus-within:ring-ring">
          <SearchIcon className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Show deployment issues…"
            className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted-foreground"
          />
        </label>
      </div>

      {!q && (
        <section className="px-5 pt-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Try
          </p>
          <ul className="mt-2 space-y-2">
            {SUGGESTIONS.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => setQ(s)}
                  className="w-full rounded-xl border border-border-soft bg-card px-3.5 py-2.5 text-left text-[13.5px] text-foreground transition hover:bg-surface-muted"
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {q && (
        <section className="px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {results.length} result{results.length === 1 ? "" : "s"}
          </p>
          <div className="mt-2 space-y-3 pb-6">
            {results.map((t) => (
              <ThreadCard key={t.id} thread={t} />
            ))}
            {results.length === 0 && (
              <p className="py-8 text-center text-[13.5px] text-muted-foreground">
                Nothing matched. Try different words.
              </p>
            )}
          </div>
        </section>
      )}
    </MobileShell>
  );
}
