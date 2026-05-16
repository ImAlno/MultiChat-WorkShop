import { Link, useLocation } from "@tanstack/react-router";
import { Inbox, Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { to: "/", label: "Inbox", icon: Inbox },
  { to: "/search", label: "Search", icon: Search },
  { to: "/focus", label: "Focus", icon: Sparkles },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav
      className="sticky bottom-0 z-20 border-t border-border-soft bg-surface/85 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-2 py-2">
        {ITEMS.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-medium transition",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon
                  className={cn("h-5 w-5", active && "stroke-[2.2]")}
                  aria-hidden
                />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
