import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, Sparkles, Send } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { PlatformChip } from "@/components/PlatformChip";
import { PriorityBadge } from "@/components/PriorityBadge";
import { getThread, getThreadMessages, type Message, type Thread } from "@/lib/mock-data";
import { summarizeThread } from "@/lib/summarize.functions";
import { timeAgo } from "@/lib/time";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/thread/$threadId")({
  head: ({ params }) => {
    const t = getThread(params.threadId);
    return {
      meta: [
        { title: t ? `${t.title} · Multichat` : "Thread · Multichat" },
        {
          name: "description",
          content: t?.summary ?? "Thread details on Multichat.",
        },
      ],
    };
  },
  loader: ({ params }): { thread: Thread; messages: Message[] } => {
    const thread = getThread(params.threadId);
    if (!thread) throw notFound();
    return { thread, messages: getThreadMessages(params.threadId) };
  },
  component: ThreadView,
  notFoundComponent: () => (
    <MobileShell>
      <div className="p-8 text-center">
        <p className="text-sm text-muted-foreground">Thread not found.</p>
        <Link
          to="/"
          className="mt-4 inline-flex text-sm font-medium text-primary"
        >
          Back to inbox
        </Link>
      </div>
    </MobileShell>
  ),
});

function ThreadView() {
  const { thread, messages } = Route.useLoaderData() as {
    thread: Thread;
    messages: Message[];
  };
  const summarize = useServerFn(summarizeThread);
  const [summary, setSummary] = useState(thread.summary);

  const mutation = useMutation({
    mutationFn: () =>
      summarize({
        data: {
          threadTitle: thread.title,
          messages: messages.map((m) => ({
            author: m.author,
            source: m.source,
            text: m.text,
          })),
        },
      }),
    onSuccess: (r: { summary?: string }) => {
      if (r?.summary) setSummary(r.summary);
    },
  });

  return (
    <MobileShell>
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border-soft bg-surface/85 px-4 py-3 backdrop-blur-xl">
        <Link
          to="/"
          aria-label="Back"
          className="rounded-full p-1.5 text-muted-foreground transition hover:bg-surface-muted hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] text-muted-foreground">
            {thread.channel}
          </p>
          <h1 className="truncate text-[15px] font-semibold tracking-tight">
            {thread.title}
          </h1>
        </div>
        <PriorityBadge priority={thread.priority} />
      </header>

      <div className="px-5 pt-5">
        <div className="rounded-2xl border border-border-soft bg-surface-muted/60 p-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              AI summary
            </span>
            <button
              type="button"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="text-[11px] font-medium text-muted-foreground transition hover:text-foreground disabled:opacity-50"
            >
              {mutation.isPending ? "Thinking…" : "Refresh"}
            </button>
          </div>
          <p className="mt-2 text-[14px] leading-relaxed text-foreground">
            {summary}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {thread.platforms.map((p) => (
              <PlatformChip key={p} platform={p} />
            ))}
          </div>
        </div>
      </div>

      <section className="px-5 py-5">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Conversation
        </h2>
        <ul className="mt-3 space-y-3">
          {messages.map((m) => (
            <li
              key={m.id}
              className="rounded-2xl border border-border-soft bg-card p-3.5 shadow-soft"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold text-primary-foreground",
                    "bg-primary/85",
                  )}
                >
                  {m.authorInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-foreground">
                    {m.author}
                  </p>
                </div>
                <PlatformChip platform={m.source} />
                <span className="text-[11px] text-muted-foreground">
                  {timeAgo(m.timestamp)}
                </span>
              </div>
              <p className="mt-2 pl-9 text-[14px] leading-relaxed text-foreground">
                {m.text}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {thread.suggestedReply && (
        <section className="px-5 pb-8">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Suggested reply
          </h2>
          <div className="mt-2 flex items-start gap-2 rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <p className="flex-1 text-[14px] leading-relaxed text-foreground">
              {thread.suggestedReply}
            </p>
            <button
              type="button"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[12px] font-semibold text-primary-foreground shadow-soft transition hover:opacity-95"
            >
              <Send className="h-3.5 w-3.5" /> Send
            </button>
          </div>
        </section>
      )}
    </MobileShell>
  );
}
