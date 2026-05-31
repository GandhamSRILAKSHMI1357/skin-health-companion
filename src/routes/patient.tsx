import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, User2 } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { getPatient, getUser, setPatient, type Patient } from "@/lib/auth";

export const Route = createFileRoute("/patient")({
  head: () => ({
    meta: [
      { title: "Patient details — DermAI" },
      { name: "description", content: "Add patient context to improve AI skin analysis." },
    ],
  }),
  component: PatientPage,
});

const EMPTY: Patient = {
  name: "",
  age: "",
  gender: "",
  skinType: "",
  history: "",
  symptoms: "",
};

function PatientPage() {
  const router = useRouter();
  const [form, setForm] = useState<Patient>(EMPTY);

  useEffect(() => {
    if (!getUser()) {
      router.navigate({ to: "/login" });
      return;
    }
    const existing = getPatient();
    if (existing) setForm(existing);
  }, [router]);

  function update<K extends keyof Patient>(key: K, value: Patient[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setPatient(form);
    router.navigate({ to: "/analyze" });
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-10 md:py-16">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
            <User2 className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Step 1 of 2</p>
            <h1 className="font-serif text-4xl md:text-5xl">Patient details</h1>
          </div>
        </div>
        <p className="text-muted-foreground mt-4 max-w-xl">
          Share a little context so DermAI can tailor observations and suggestions. Nothing is
          shared without your action.
        </p>

        <form onSubmit={submit} className="mt-10 bento-card p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Full name" value={form.name} onChange={(v) => update("name", v)} />
          <Input label="Age" value={form.age} onChange={(v) => update("age", v)} type="number" />
          <Select
            label="Gender"
            value={form.gender}
            onChange={(v) => update("gender", v)}
            options={["", "Female", "Male", "Non‑binary", "Prefer not to say"]}
          />
          <Select
            label="Skin type"
            value={form.skinType}
            onChange={(v) => update("skinType", v)}
            options={["", "Type I — very fair", "Type II — fair", "Type III — medium", "Type IV — olive", "Type V — brown", "Type VI — deep"]}
          />
          <Textarea
            label="Medical history"
            value={form.history}
            onChange={(v) => update("history", v)}
            placeholder="Allergies, medications, prior skin issues…"
            className="md:col-span-2"
          />
          <Textarea
            label="Current symptoms"
            value={form.symptoms}
            onChange={(v) => update("symptoms", v)}
            placeholder="When did it start? Itchy, painful, spreading?"
            className="md:col-span-2"
          />
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full gradient-primary text-primary-foreground"
            >
              Continue to scan <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

function Input({
  label, value, onChange, type = "text",
}: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
      />
    </label>
  );
}

function Select({
  label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o || "Select…"}</option>
        ))}
      </select>
    </label>
  );
}

function Textarea({
  label, value, onChange, placeholder, className = "",
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/40 resize-none"
      />
    </label>
  );
}
