import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Camera, MessageCircle, ShieldCheck, Sparkles, Stethoscope } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DermAI — AI skin analysis & dermatology guidance" },
      {
        name: "description",
        content:
          "Upload or capture a skin photo, get AI-powered observations, personalised suggestions and a friendly dermatology chatbot. Educational tool, not a diagnosis.",
      },
      { property: "og:title", content: "DermAI — AI skin analysis" },
      { property: "og:description", content: "AI-powered skin photo analysis and dermatology chatbot." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 pt-12 pb-24">
        {/* Hero bento */}
        <section className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="bento-card md:col-span-4 p-8 md:p-12 gradient-warm pattern-grain relative overflow-hidden">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary/80">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Skin intelligence
            </span>
            <h1 className="font-serif text-5xl md:text-7xl mt-5 leading-[1.02]">
              See your skin <em className="text-primary not-italic">clearly</em>.
            </h1>
            <p className="mt-5 max-w-md text-muted-foreground text-base md:text-lg">
              Snap a photo, share a little context, and DermAI returns gentle, structured observations
              with next steps — plus an AI companion that listens.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full gradient-primary text-primary-foreground"
              >
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/analyze"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border bg-background/60 backdrop-blur"
              >
                Try a scan
              </Link>
            </div>
          </div>
          <div className="bento-card md:col-span-2 p-6 flex flex-col justify-between">
            <Stethoscope className="h-6 w-6 text-primary" />
            <div>
              <p className="font-serif text-3xl leading-tight">A dermatologist‑shaped companion.</p>
              <p className="mt-3 text-sm text-muted-foreground">
                Educational guidance, not a diagnosis. Always confirm with a licensed dermatologist.
              </p>
            </div>
          </div>

          <FeatureCard
            icon={<Camera className="h-5 w-5" />}
            title="Capture"
            body="Upload a photo or use your camera. Lighting tips included."
            className="md:col-span-2"
          />
          <FeatureCard
            icon={<Sparkles className="h-5 w-5" />}
            title="Analyse"
            body="Vision AI returns structured observations & confidence."
            className="md:col-span-2"
          />
          <FeatureCard
            icon={<MessageCircle className="h-5 w-5" />}
            title="Chat"
            body="Ask follow‑ups in plain language, anytime."
            className="md:col-span-2"
          />

          <div className="bento-card md:col-span-6 p-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <p className="text-sm text-muted-foreground">
                Your photos & notes stay on your device for this demo. Nothing leaves without your action.
              </p>
            </div>
            <Link
              to="/patient"
              className="text-sm font-medium text-primary inline-flex items-center gap-1"
            >
              Add patient details <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  body,
  className = "",
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  className?: string;
}) {
  return (
    <div className={`bento-card p-6 ${className}`}>
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-primary">
        {icon}
      </span>
      <h3 className="font-serif text-2xl mt-4">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1.5">{body}</p>
    </div>
  );
}
