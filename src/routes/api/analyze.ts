import { createFileRoute } from "@tanstack/react-router";
import { generateText } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

type Body = {
  imageBase64?: string;
  mimeType?: string;
  patient?: Record<string, string> | null;
};

export const Route = createFileRoute("/api/analyze")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as Body;
        if (!body.imageBase64 || !body.mimeType) {
          return new Response("Missing image", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");

        const patientCtx = body.patient
          ? `Patient context:\n${Object.entries(body.patient)
              .filter(([, v]) => v)
              .map(([k, v]) => `- ${k}: ${v}`)
              .join("\n")}`
          : "No additional patient context provided.";

        try {
          const result = await generateText({
            model,
            messages: [
              {
                role: "system",
                content:
                  "You are DermAI, an educational dermatology assistant. You analyse photos of skin and return structured observations. You are NOT a medical device and you must always tell the user to confirm with a licensed dermatologist. Respond ONLY with strict JSON matching this shape: {\"condition\": string, \"confidence\": \"low\"|\"medium\"|\"high\", \"summary\": string, \"observations\": string[], \"suggestions\": string[], \"urgency\": \"routine\"|\"soon\"|\"urgent\", \"disclaimer\": string}. No markdown, no code fences.",
              },
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: `Analyse the attached skin photo and produce the JSON.\n\n${patientCtx}`,
                  },
                  {
                    type: "image",
                    image: `data:${body.mimeType};base64,${body.imageBase64}`,
                  },
                ],
              },
            ],
          });

          const text = result.text.trim().replace(/^```json\s*/i, "").replace(/```$/, "");
          let parsed: unknown;
          try {
            parsed = JSON.parse(text);
          } catch {
            parsed = {
              condition: "Unable to parse",
              confidence: "low",
              summary: text.slice(0, 500),
              observations: [],
              suggestions: ["Please retry with a clearer, well-lit photo."],
              urgency: "routine",
              disclaimer: "Educational tool. Not a medical diagnosis.",
            };
          }
          return Response.json(parsed);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Analysis failed";
          const status = /429/.test(message) ? 429 : /402/.test(message) ? 402 : 500;
          return new Response(message, { status });
        }
      },
    },
  },
});
