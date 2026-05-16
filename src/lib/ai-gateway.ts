import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

// Creates an OpenAI-compatible AI provider with custom configuration
export const createAiGatewayProvider = (apiKey: string) =>
  createOpenAICompatible({
    name: "custom-ai",
    baseURL: process.env.AI_GATEWAY_BASE_URL || "https://api.openai.com/v1",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
    },
  });
