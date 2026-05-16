import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { ThreadCard } from "@/components/ThreadCard";
import { threads } from "@/lib/mock-data";

export const Route = createFileRoute("/focus")({
  head: () => ({
    meta: [
      { title: "Focus · Multichat" },
      {
        name: "description",
        content: "Only the conversations that truly need you, right now.",
      },
    ],
  }),
  component: Focus,
});

function Focus() {
  const focus = threads.filter(
    (t) => t.priority === "urgent" || t.priority === "requires_response",
  );

  return (
    <MobileShell>
      <header className="px-5 pt-8 pb-4">
        <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Focus
        </p>
        <h1 className="mt-1 text-[26px] font-semibold leading-tight tracking-tight">
          What truly needs you.
        </h1>
        <p className="mt-1 text-[14px] text-muted-foreground">
          Everything else is quiet, on purpose.
        </p>
      </header>

      <section className="px-5 pb-8">
        <div className="space-y-3">
          {focus.map((t) => (
            <ThreadCard key={t.id} thread={t} />
          ))}
          {focus.length === 0 && (
            <p className="py-10 text-center text-[14px] text-muted-foreground">
              You're all clear. Breathe.
            </p>
          )}
        </div>
      </section>
    </MobileShell>
  );
}
