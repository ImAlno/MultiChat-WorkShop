import { type ReactNode } from "react";
import { BottomNav } from "./BottomNav";

/**
 * Mobile-first phone-shaped shell. On desktop we center a max-w-md column
 * so the experience always feels like a focused mobile companion.
 */
export function MobileShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-surface shadow-soft md:my-6 md:min-h-[calc(100dvh-3rem)] md:rounded-3xl md:border md:border-border-soft md:shadow-lift">
        <div className="flex-1 overflow-y-auto">{children}</div>
        <BottomNav />
      </div>
    </div>
  );
}
