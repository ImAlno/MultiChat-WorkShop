import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createAiGatewayProvider } from "./ai-gateway";

const InputSchema = z.object({
  threadTitle: z.string().min(1).max(200),
  messages: z
    .array(
      z.object({
        author: z.string().min(1).max(80),
        source: z.string().min(1).max(30),
        text: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(50),
});

export const summarizeThread = createServerFn({ method: "POST" })
  .inputValidator((input) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.AI_API_KEY;
    if (!key) {
      return {
        summary: "AI summary is not configured yet.",
        priority: "informational" as const,
        error: "missing_key",
      };
    }

    const gateway = createAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    const transcript = data.messages
      .map((m) => `[${m.source}] ${m.author}: ${m.text}`)
      .join("\n");

    try {
      const { text } = await generateText({
        model,
        system:
          "You are a calm, concise communication assistant. Summarize a multi-platform conversation in 2 short sentences. No greetings, no preamble, no markdown. Plain text only.",
        prompt: `Thread: ${data.threadTitle}\n\nMessages:\n${transcript}\n\nWrite a 2-sentence summary.`,
      });

      return {
        summary: text.trim(),
        priority: "informational" as const,
        error: null,
      };
    } catch (err) {
      console.error("summarizeThread failed", err);
      return {
        summary: "Couldn't generate a fresh summary right now.",
        priority: "informational" as const,
        error: "ai_failed",
      };
    }
  });
