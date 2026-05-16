# Multichat

> A calm AI layer over fragmented communication.

Multichat unifies messages from platforms like Discord, Slack, Gmail, Jira,
Telegram and Microsoft Teams into a single quiet, AI-summarized inbox —
designed to reduce overload, not add to it.

This repository is the **mobile-first web MVP**.

## What's in the MVP

- **Unified inbox** of mock threads from Discord & Slack
- **AI thread summaries** via the Lovable AI Gateway
- **Priority labels** — `urgent`, `requires_response`, `informational`
- **Thread detail** view with grouped messages and platform indicators
- **Suggested replies** (mocked)
- **Natural-language search** (client-side filter; semantic search is the next step)
- **Focus view** showing only what actually needs you

## Screens

- `/` — Unified inbox
- `/thread/:id` — Thread detail with AI summary
- `/search` — Natural-language search
- `/focus` — Only urgent & needs-reply threads

## Tech stack

- **TanStack Start** (React 19, Vite 7, SSR-ready)
- **TanStack Server Functions** as the backend boundary (replaces FastAPI in the original spec)
- **Tailwind CSS v4** with a calm, Linear-inspired design system in `src/styles.css`
- **AI SDK + Lovable AI Gateway** (`google/gemini-3-flash-preview`) for summaries
- **Zod** for input validation

## Architecture

```
src/
├── components/          # UI building blocks (ThreadCard, PriorityBadge, …)
├── lib/
│   ├── mock-data.ts     # Normalized message + thread schema, seed data
│   ├── ai-gateway.ts    # Lovable AI Gateway provider
│   ├── summarize.functions.ts  # Server function: AI thread summary
│   └── time.ts          # Relative-time helper
├── routes/              # File-based routes (index, thread.$threadId, search, focus)
└── styles.css           # Design tokens (semantic colors, radius, shadows)
```

### Normalized message schema

```ts
{
  id: string,
  source: "discord" | "slack" | "gmail" | "jira" | "telegram" | "teams",
  author: string,
  text: string,
  timestamp: string,   // ISO
  threadId: string,
  priority?: "urgent" | "requires_response" | "informational"
}
```

### "Endpoints" (server functions)

The original spec asked for `GET /messages`, `GET /message/{id}`, `POST /summarize`.
In this stack those are typed RPCs:

| Spec endpoint     | Implementation                                          |
| ----------------- | ------------------------------------------------------- |
| `GET /messages`   | `threads` export from `src/lib/mock-data.ts`            |
| `GET /message/:id`| `getThread(id)` + `getThreadMessages(id)`               |
| `POST /summarize` | `summarizeThread` server function (Lovable AI Gateway)  |

Swapping to real ingestion later means replacing the mock module with calls to
real connectors — UI and AI layer stay unchanged.

## Running locally

This project runs in Lovable's sandbox automatically. Locally:

```bash
bun install
bun run dev
```

The Lovable AI Gateway key (`LOVABLE_API_KEY`) is provisioned by Lovable Cloud
and read server-side inside `summarizeThread`. No `.env` setup needed in
Lovable; for a self-hosted deploy set `LOVABLE_API_KEY` in your runtime env.

## Design principles

- **Calm**, not enterprise. Soft shadows, generous spacing, muted palette.
- **Mobile-native** feel: phone-shaped column even on desktop.
- **Emotionally intelligent**: priority tags read like "Needs reply" / "FYI",
  not red-alert sirens.
- All visual choices live in `src/styles.css` design tokens — no hardcoded
  colors in components.

## Roadmap

- Real Discord & Slack ingestion (OAuth + webhooks)
- Lovable Cloud (Postgres) persistence + per-user threads
- Embeddings-based semantic search
- AI-suggested replies grounded in conversation history
- Emotional tone labels
- PWA install + push notifications

## What this MVP is not

- Not a Slack/Discord clone
- Not an enterprise monitoring dashboard
- Not a generic AI chat wrapper

It is one quiet place for the conversations that matter.
