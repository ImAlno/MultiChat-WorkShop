import { type Platform } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const LABEL: Record<Platform, string> = {
  discord: "Discord",
  slack: "Slack",
  gmail: "Gmail",
  jira: "Jira",
  telegram: "Telegram",
  teams: "Teams",
};

const DOT: Record<Platform, string> = {
  discord: "bg-platform-discord",
  slack: "bg-platform-slack",
  gmail: "bg-platform-gmail",
  jira: "bg-platform-jira",
  telegram: "bg-platform-telegram",
  teams: "bg-platform-teams",
};

export function PlatformChip({
  platform,
  className,
}: {
  platform: Platform;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground",
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", DOT[platform])} />
      {LABEL[platform]}
    </span>
  );
}

export function PlatformDots({ platforms }: { platforms: Platform[] }) {
  return (
    <div className="flex -space-x-1">
      {platforms.map((p) => (
        <span
          key={p}
          title={LABEL[p]}
          className={cn(
            "h-2.5 w-2.5 rounded-full ring-2 ring-surface",
            DOT[p],
          )}
        />
      ))}
    </div>
  );
}
