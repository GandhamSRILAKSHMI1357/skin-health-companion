import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import { setUser } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — DermAI" },
      { name: "description", content: "Sign in to DermAI to scan and track skin observations." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setTimeout(() => {
      setUser({ name: name || email.split("@")[0], email });
      router.navigate({ to: "/patient" });
    }, 400);
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left poster */}
      <div className="hidden md:flex flex-col justify-between p-10 gradient-warm pattern-grain border-r border-border">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl gradient-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="font-serif text-2xl">DermAI</span>
        </div>
        <div>
          <p className="font-serif text-5xl leading-tight max-w-md">
            Calm, careful skin guidance — in your pocket.
          </p>
          <p className="text-muted-foreground mt-4 max-w-sm">
            Sign in to scan, save notes, and chat with an AI dermatology companion.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          DermAI is an educational tool, not a medical device.
        </p>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <div className="md:hidden flex items-center gap-2 mb-8">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl gradient-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="font-serif text-2xl">DermAI</span>
          </div>
          <h1 className="font-serif text-4xl">
            {mode === "signin" ? "Welcome back." : "Create your account."}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {mode === "signin" ? "Sign in to continue." : "A few details and you're in."}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            {mode === "signup" && (
              <Field
                icon={<Sparkles className="h-4 w-4" />}
                label="Full name"
                value={name}
                onChange={setName}
                type="text"
                placeholder="Jane Cooper"
              />
            )}
            <Field
              icon={<Mail className="h-4 w-4" />}
              label="Email"
              value={email}
              onChange={setEmail}
              type="email"
              placeholder="you@email.com"
            />
            <Field
              icon={<Lock className="h-4 w-4" />}
              label="Password"
              value={password}
              onChange={setPassword}
              type="password"
              placeholder="••••••••"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full gradient-primary text-primary-foreground disabled:opacity-60"
            >
              {loading ? "One moment…" : mode === "signin" ? "Sign in" : "Create account"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="text-sm text-muted-foreground mt-6 text-center">
            {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-primary font-medium hover:underline"
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  icon,
  label,
  value,
  onChange,
  type,
  placeholder,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="mt-1.5 flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 focus-within:ring-2 focus-within:ring-ring/40">
        <span className="text-muted-foreground">{icon}</span>
        <input
          required
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-sm"
        />
      </div>
    </label>
  );
}
