import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages, context } = (await request.json()) as {
          messages?: UIMessage[];
          context?: { patient?: Record<string, string> | null; analysis?: unknown };
        };
        if (!Array.isArray(messages)) {
          return new Response("Messages required", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");

        const ctxString = context
          ? `Patient context: ${JSON.stringify(context.patient ?? {})}\nLatest analysis: ${JSON.stringify(context.analysis ?? {})}`
          : "";

        const result = streamText({
          model,
          system: `You are DermAI, a warm, careful dermatology assistant. Give educational guidance about skin conditions, lifestyle suggestions, and when to see a dermatologist. Be concise, use plain language, and end critical points with a gentle reminder to consult a licensed dermatologist. Never provide a definitive diagnosis. ${ctxString}`,
          messages: await convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse();
      },
    },
  },
});
