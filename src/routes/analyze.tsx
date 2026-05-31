import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Camera, Upload, Loader2, Sparkles, AlertTriangle, Send, RotateCcw, ImageIcon, ShieldAlert,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { getPatient, getUser } from "@/lib/auth";

export const Route = createFileRoute("/analyze")({
  head: () => ({
    meta: [
      { title: "Analyze — DermAI" },
      { name: "description", content: "Upload or capture a skin photo and get AI-powered observations." },
    ],
  }),
  component: AnalyzePage,
});

type Analysis = {
  condition: string;
  confidence: "low" | "medium" | "high";
  summary: string;
  observations: string[];
  suggestions: string[];
  urgency: "routine" | "soon" | "urgent";
  disclaimer: string;
};

function AnalyzePage() {
  const router = useRouter();
  const [image, setImage] = useState<{ b64: string; mime: string; url: string } | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const patient = useMemo(() => getPatient(), []);

  useEffect(() => {
    if (!getUser()) router.navigate({ to: "/login" });
  }, [router]);

  async function onFile(file: File) {
    setError(null);
    setAnalysis(null);
    const url = URL.createObjectURL(file);
    const b64 = await fileToBase64(file);
    setImage({ b64, mime: file.type || "image/jpeg", url });
  }

  async function runAnalysis() {
    if (!image) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: image.b64, mimeType: image.mime, patient }),
      });
      if (!res.ok) {
        const msg = await res.text();
        if (res.status === 429) throw new Error("Rate limit reached — please try again in a moment.");
        if (res.status === 402) throw new Error("AI credits exhausted. Add credits in Workspace → Usage.");
        throw new Error(msg || "Analysis failed.");
      }
      const data = (await res.json()) as Analysis;
      setAnalysis(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setImage(null);
    setAnalysis(null);
    setError(null);
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-8 md:py-12">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Step 2 of 2</p>
          <h1 className="font-serif text-4xl md:text-5xl mt-1">Skin analysis</h1>
          <p className="text-muted-foreground mt-2 max-w-xl text-sm">
            Capture or upload a well‑lit, in‑focus photo of the area. AI will return structured observations and gentle next steps.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
          {/* Capture card */}
          <section className="bento-card lg:col-span-3 p-6">
            <h2 className="font-serif text-2xl">Capture</h2>
            <p className="text-sm text-muted-foreground mt-1">Choose a source.</p>

            <div className="mt-5 aspect-[4/3] rounded-2xl overflow-hidden border border-border bg-muted/40 relative">
              {image ? (
                <img src={image.url} alt="Selected" className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 grid place-items-center text-muted-foreground">
                  <div className="text-center">
                    <ImageIcon className="h-8 w-8 mx-auto opacity-50" />
                    <p className="text-sm mt-2">No photo yet</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => cameraRef.current?.click()}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-border bg-card hover:bg-accent text-sm"
              >
                <Camera className="h-4 w-4" /> Camera
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-border bg-card hover:bg-accent text-sm"
              >
                <Upload className="h-4 w-4" /> Upload
              </button>
              <input
                ref={cameraRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
              />
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
              />
            </div>

            <div className="mt-4 flex gap-3">
              <button
                disabled={!image || loading}
                onClick={runAnalysis}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full gradient-primary text-primary-foreground disabled:opacity-50"
              >
                {loading ? (<><Loader2 className="h-4 w-4 animate-spin" /> Analysing…</>) : (<><Sparkles className="h-4 w-4" /> Analyse photo</>)}
              </button>
              {image && (
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-full border border-border hover:bg-accent text-sm"
                >
                  <RotateCcw className="h-4 w-4" /> Reset
                </button>
              )}
            </div>

            {error && (
              <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive p-3 text-sm flex gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" /> {error}
              </div>
            )}
          </section>

          {/* Results */}
          <section className="bento-card lg:col-span-3 p-6 min-h-[420px]">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl">Observations</h2>
              {analysis && (
                <span className={`text-xs px-2.5 py-1 rounded-full border ${urgencyChip(analysis.urgency)}`}>
                  {analysis.urgency}
                </span>
              )}
            </div>

            {!analysis && !loading && (
              <p className="text-sm text-muted-foreground mt-2">
                Your structured AI observations will appear here.
              </p>
            )}
            {loading && (
              <div className="mt-8 grid place-items-center text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p className="text-sm mt-3">Looking carefully…</p>
              </div>
            )}

            {analysis && (
              <div className="mt-4 space-y-5">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Most likely</p>
                  <p className="font-serif text-3xl mt-1">{analysis.condition}</p>
                  <p className="text-xs text-muted-foreground mt-1">Confidence: {analysis.confidence}</p>
                </div>
                <p className="text-sm leading-relaxed">{analysis.summary}</p>

                <Block title="What we see" items={analysis.observations} />
                <Block title="Suggestions" items={analysis.suggestions} accent />

                <div className="rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground flex gap-2">
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                  {analysis.disclaimer}
                </div>
              </div>
            )}
          </section>

          {/* Chat */}
          <section className="bento-card lg:col-span-6 p-0 overflow-hidden">
            <ChatBox analysis={analysis} />
          </section>
        </div>
      </main>
    </div>
  );
}

function Block({ title, items, accent = false }: { title: string; items: string[]; accent?: boolean }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{title}</p>
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2 text-sm">
            <span className={`mt-2 h-1.5 w-1.5 rounded-full shrink-0 ${accent ? "bg-primary" : "bg-foreground/40"}`} />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function urgencyChip(u: Analysis["urgency"]) {
  if (u === "urgent") return "border-destructive/40 bg-destructive/10 text-destructive";
  if (u === "soon") return "border-primary/40 bg-primary/10 text-primary";
  return "border-border bg-accent text-accent-foreground";
}

function ChatBox({ analysis }: { analysis: Analysis | null }) {
  const patient = useMemo(() => getPatient(), []);
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: () => ({ context: { patient, analysis } }),
      }),
    [patient, analysis],
  );
  const { messages, sendMessage, status } = useChat({ transport });
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    sendMessage({ text });
    setInput("");
  }

  return (
    <div className="flex flex-col h-[520px]">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl gradient-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <p className="font-serif text-xl leading-none">Ask DermAI</p>
            <p className="text-xs text-muted-foreground mt-1">Follow‑up questions about your skin</p>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        {messages.length === 0 && (
          <div className="text-sm text-muted-foreground">
            Try: <em>"What over‑the‑counter options might help?"</em> or <em>"When should I see a dermatologist?"</em>
          </div>
        )}
        {messages.map((m: UIMessage) => (
          <Bubble key={m.id} role={m.role}>
            {renderParts(m)}
          </Bubble>
        ))}
        {busy && messages[messages.length - 1]?.role === "user" && (
          <Bubble role="assistant">
            <span className="inline-flex gap-1">
              <Dot /> <Dot delay={0.15} /> <Dot delay={0.3} />
            </span>
          </Bubble>
        )}
      </div>

      <form onSubmit={submit} className="p-4 border-t border-border bg-muted/30 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a follow‑up…"
          className="flex-1 rounded-full border border-border bg-background px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="inline-flex items-center justify-center h-11 w-11 rounded-full gradient-primary text-primary-foreground disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

function renderParts(m: UIMessage) {
  return m.parts.map((p, i) =>
    p.type === "text" ? <span key={i}>{p.text}</span> : null,
  );
}

function Bubble({ role, children }: { role: string; children: React.ReactNode }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap " +
          (isUser ? "gradient-primary text-primary-foreground rounded-br-sm" : "bg-accent text-accent-foreground rounded-bl-sm")
        }
      >
        {children}
      </div>
    </div>
  );
}

function Dot({ delay = 0 }: { delay?: number }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 rounded-full bg-current animate-bounce"
      style={{ animationDelay: `${delay}s` }}
    />
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      resolve(res.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
