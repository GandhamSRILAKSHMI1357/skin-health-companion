// Lightweight client-side auth store for the demo. Replace with real auth later.
import { useEffect, useState } from "react";

const KEY = "dermai_user";
const PATIENT_KEY = "dermai_patient";

export type User = { name: string; email: string };
export type Patient = {
  name: string;
  age: string;
  gender: string;
  skinType: string;
  history: string;
  symptoms: string;
};

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as User) : null;
}
export function setUser(u: User | null) {
  if (typeof window === "undefined") return;
  if (u) localStorage.setItem(KEY, JSON.stringify(u));
  else localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("dermai-auth"));
}

export function getPatient(): Patient | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(PATIENT_KEY);
  return raw ? (JSON.parse(raw) as Patient) : null;
}
export function setPatient(p: Patient | null) {
  if (typeof window === "undefined") return;
  if (p) localStorage.setItem(PATIENT_KEY, JSON.stringify(p));
  else localStorage.removeItem(PATIENT_KEY);
}

export function useUser() {
  const [user, setUserState] = useState<User | null>(null);
  useEffect(() => {
    setUserState(getUser());
    const handler = () => setUserState(getUser());
    window.addEventListener("dermai-auth", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("dermai-auth", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return user;
}
