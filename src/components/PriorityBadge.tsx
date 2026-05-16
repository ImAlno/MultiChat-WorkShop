import { type Priority } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const STYLES: Record<Priority, { cls: string; label: string }> = {
  urgent: {
    cls: "bg-urgent text-urgent-foreground",
    label: "Urgent",
  },
  requires_response: {
    cls: "bg-action text-action-foreground",
    label: "Needs reply",
  },
  informational: {
    cls: "bg-info text-info-foreground",
    label: "FYI",
  },
};

export function PriorityBadge({
  priority,
  className,
}: {
  priority: Priority;
  className?: string;
}) {
  const { cls, label } = STYLES[priority];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium tracking-tight",
        cls,
        className,
      )}
    >
      {label}
    </span>
  );
}
