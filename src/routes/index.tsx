import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { ThreadCard } from "@/components/ThreadCard";
import { threads } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Inbox · Multichat" },
      {
        name: "description",
        content:
          "Your unified inbox across Discord, Slack and more — quietly summarized by AI.",
      },
    ],
  }),
  component: Inbox,
});

function Inbox() {
  const urgent = threads.filter((t) => t.priority === "urgent");
  const rest = threads.filter((t) => t.priority !== "urgent");
  const unread = threads.reduce((n, t) => n + t.unread, 0);

  return (
    <MobileShell>
      <header className="px-5 pt-8 pb-4">
        <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Today
        </p>
        <h1 className="mt-1 text-[26px] font-semibold leading-tight tracking-tight text-foreground">
          A calm inbox.
        </h1>
        <p className="mt-1 text-[14px] text-muted-foreground">
          {unread} new across {threads.length} threads. Nothing urgent has been
          missed.
        </p>
      </header>

      {urgent.length > 0 && (
        <section className="px-5 pb-2">
          <SectionLabel>Needs your attention</SectionLabel>
          <div className="mt-2 space-y-3">
            {urgent.map((t) => (
              <ThreadCard key={t.id} thread={t} />
            ))}
          </div>
        </section>
      )}

      <section className="px-5 py-4">
        <SectionLabel>Everything else</SectionLabel>
        <div className="mt-2 space-y-3 pb-6">
          {rest.map((t) => (
            <ThreadCard key={t.id} thread={t} />
          ))}
        </div>
      </section>
    </MobileShell>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
      {children}
    </h2>
  );
}
