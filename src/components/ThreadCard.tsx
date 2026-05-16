import { Link } from "@tanstack/react-router";
import { type Thread } from "@/lib/mock-data";
import { PlatformDots } from "./PlatformChip";
import { PriorityBadge } from "./PriorityBadge";
import { timeAgo } from "@/lib/time";

export function ThreadCard({ thread }: { thread: Thread }) {
  return (
    <Link
      to="/thread/$threadId"
      params={{ threadId: thread.id }}
      className="group block rounded-2xl border border-border-soft bg-card p-4 shadow-soft transition hover:-translate-y-px hover:shadow-lift focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="truncate">{thread.channel}</span>
            <span aria-hidden>·</span>
            <span>{timeAgo(thread.lastActivity)}</span>
          </div>
          <h3 className="mt-1 truncate text-[15px] font-semibold tracking-tight text-foreground">
            {thread.title}
          </h3>
        </div>
        <PriorityBadge priority={thread.priority} />
      </div>

      <p className="mt-2 line-clamp-3 text-[13.5px] leading-relaxed text-muted-foreground">
        {thread.summary}
      </p>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PlatformDots platforms={thread.platforms} />
          <span className="text-[11px] text-muted-foreground">
            {thread.participants.slice(0, 2).join(", ")}
            {thread.participants.length > 2 &&
              ` +${thread.participants.length - 2}`}
          </span>
        </div>
        {thread.unread > 0 && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
            {thread.unread} new
          </span>
        )}
      </div>
    </Link>
  );
}
