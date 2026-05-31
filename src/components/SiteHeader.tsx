import { Link, useRouter } from "@tanstack/react-router";
import { Sparkles, LogOut } from "lucide-react";
import { useUser, setUser } from "@/lib/auth";

export function SiteHeader() {
  const user = useUser();
  const router = useRouter();
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/70 border-b border-border">
      <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl gradient-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="font-serif text-2xl leading-none">DermAI</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {user ? (
            <>
              <Link
                to="/patient"
                className="px-3 py-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
              >
                Patient
              </Link>
              <Link
                to="/analyze"
                className="px-3 py-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
              >
                Analyze
              </Link>
              <button
                onClick={() => {
                  setUser(null);
                  router.navigate({ to: "/login" });
                }}
                className="ml-2 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 rounded-full gradient-primary text-primary-foreground text-sm"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
