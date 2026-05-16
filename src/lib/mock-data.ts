// Mock unified communication data for the Multichat MVP.
// Replace with real ingestion later (Discord/Slack/Gmail/...).

export type Platform =
  | "discord"
  | "slack"
  | "gmail"
  | "jira"
  | "telegram"
  | "teams";

export type Priority = "urgent" | "requires_response" | "informational";

export interface Message {
  id: string;
  threadId: string;
  source: Platform;
  author: string;
  authorInitials: string;
  text: string;
  timestamp: string; // ISO
}

export interface Thread {
  id: string;
  title: string;
  channel: string;
  platforms: Platform[];
  priority: Priority;
  summary: string;
  participants: string[];
  lastActivity: string; // ISO
  unread: number;
  suggestedReply?: string;
}

const now = Date.now();
const minutesAgo = (m: number) => new Date(now - m * 60_000).toISOString();
const hoursAgo = (h: number) => new Date(now - h * 3_600_000).toISOString();

export const threads: Thread[] = [
  {
    id: "t1",
    title: "Deployment incident — needs attention",
    channel: "#eng-incidents",
    platforms: ["discord", "slack"],
    priority: "urgent",
    summary:
      "Production API is returning 503s after the 14:20 deploy. Maya is rolling back; on-call asks for confirmation before the next release.",
    participants: ["Maya", "Daniel", "On-call"],
    lastActivity: minutesAgo(6),
    unread: 4,
    suggestedReply:
      "Approved to roll back. Pause releases until post-mortem is scheduled.",
  },
  {
    id: "t2",
    title: "Design feedback from the team",
    channel: "#design-review",
    platforms: ["slack"],
    priority: "requires_response",
    summary:
      "Sofia and Theo reviewed the onboarding redesign. They like the calmer hierarchy but want a clearer primary CTA on step 2.",
    participants: ["Sofia", "Theo"],
    lastActivity: minutesAgo(42),
    unread: 2,
    suggestedReply:
      "Thanks — I'll bump the CTA contrast and share a revised step 2 today.",
  },
  {
    id: "t3",
    title: "Mom sent photos today",
    channel: "Family",
    platforms: ["telegram"],
    priority: "informational",
    summary:
      "Photos from the garden and a short voice note. Nothing time-sensitive — she just wanted to say hi.",
    participants: ["Mom"],
    lastActivity: hoursAgo(2),
    unread: 1,
  },
  {
    id: "t4",
    title: "Q3 roadmap sync notes",
    channel: "#product",
    platforms: ["slack", "discord"],
    priority: "informational",
    summary:
      "Consensus on shipping the integrations layer first. AI features move to Q4 unless the partnership lands.",
    participants: ["Anna", "Lev", "Priya"],
    lastActivity: hoursAgo(5),
    unread: 0,
  },
  {
    id: "t5",
    title: "Customer escalation — Acme Co.",
    channel: "#support",
    platforms: ["slack"],
    priority: "requires_response",
    summary:
      "Acme reports degraded webhook delivery since Monday. They need an ETA before their EOD.",
    participants: ["Renee", "Acme"],
    lastActivity: hoursAgo(1),
    unread: 3,
    suggestedReply:
      "Investigating now — I'll share a written update within 2 hours.",
  },
];

export const messages: Message[] = [
  // t1
  { id: "m1", threadId: "t1", source: "slack", author: "On-call", authorInitials: "OC", text: "Pager just went off — 503s spiking from api-edge.", timestamp: minutesAgo(18) },
  { id: "m2", threadId: "t1", source: "discord", author: "Maya", authorInitials: "MA", text: "Confirmed. It started right after the 14:20 deploy. Rolling back now.", timestamp: minutesAgo(14) },
  { id: "m3", threadId: "t1", source: "slack", author: "Daniel", authorInitials: "DA", text: "Should we freeze releases until we have a post-mortem?", timestamp: minutesAgo(9) },
  { id: "m4", threadId: "t1", source: "discord", author: "Maya", authorInitials: "MA", text: "Rollback in progress. ETA 3 min. Need approval to pause next release window.", timestamp: minutesAgo(6) },

  // t2
  { id: "m5", threadId: "t2", source: "slack", author: "Sofia", authorInitials: "SO", text: "Love the new hierarchy. Step 2 feels a bit quiet though.", timestamp: minutesAgo(58) },
  { id: "m6", threadId: "t2", source: "slack", author: "Theo", authorInitials: "TH", text: "+1 — primary CTA blends into the card. Maybe a stronger accent?", timestamp: minutesAgo(42) },

  // t3
  { id: "m7", threadId: "t3", source: "telegram", author: "Mom", authorInitials: "MO", text: "The roses opened! Sending a few photos 🌹", timestamp: hoursAgo(2) },

  // t4
  { id: "m8", threadId: "t4", source: "discord", author: "Anna", authorInitials: "AN", text: "Recap: integrations first, AI moves to Q4 if the partnership slips.", timestamp: hoursAgo(5) },
  { id: "m9", threadId: "t4", source: "slack", author: "Lev", authorInitials: "LV", text: "Agreed. I'll update the roadmap doc tonight.", timestamp: hoursAgo(5) },

  // t5
  { id: "m10", threadId: "t5", source: "slack", author: "Renee", authorInitials: "RE", text: "Acme's CTO pinged me — webhooks have been flaky since Monday.", timestamp: hoursAgo(1) },
  { id: "m11", threadId: "t5", source: "slack", author: "Acme", authorInitials: "AC", text: "We need an ETA before EOD or we'll have to escalate internally.", timestamp: minutesAgo(50) },
];

export function getThread(id: string): Thread | undefined {
  return threads.find((t) => t.id === id);
}

export function getThreadMessages(id: string): Message[] {
  return messages
    .filter((m) => m.threadId === id)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}
