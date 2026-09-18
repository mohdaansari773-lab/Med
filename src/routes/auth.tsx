import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Mail, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { friendlyAuthError } from "@/lib/auth-messages";
import { GoogleButton } from "@/components/google-button";
import { PasswordField } from "@/components/password-field";

type Mode = "signin" | "signup";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { mode?: Mode } =>
    search["mode"] === "signup" ? { mode: "signup" } : {},
  head: () => ({
    meta: [
      { title: "Sign In — MediVault India" },
      {
        name: "description",
        content: "Sign in to save favourites, track learning progress and keep your review schedule.",
      },
      { property: "og:title", content: "Sign In — MediVault India" },
      { property: "og:description", content: "Access your MediVault India learning account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const search = useSearch({ from: "/auth" });
  const [mode, setMode] = useState<Mode>(search.mode === "signup" ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) void navigate({ to: "/", replace: true });
  }, [user, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setBusy(true);
    try {
      const { error } =
        mode === "signin"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({
              email,
              password,
              options: { emailRedirectTo: window.location.origin },
            });
      if (error) {
        toast.error(friendlyAuthError(error));
      } else if (mode === "signup") {
        setSent(true);
        toast.success("Almost there — check your inbox to confirm your email.");
      }
    } catch {
      toast.error("We couldn't connect right now. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function forgotPassword() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter your email above first, then tap “Forgot password?”.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) toast.error(friendlyAuthError(error));
    else toast.success("Password reset link sent. Please check your email.");
  }

  return (
    <div className="animate-fade-up mx-auto max-w-sm space-y-5 py-6">
      <header className="text-center">
        <span className="mx-auto mb-3 grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground">
          <Stethoscope className="size-5" aria-hidden />
        </span>
        <h1 className="font-display text-2xl font-bold">
          MediVault <span className="text-primary">India</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Learn medicines. Understand pharmacology.
        </p>
      </header>

      <div className="surface space-y-4 p-5">
        <GoogleButton />

        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <PasswordField
            id="password"
            label="Password"
            value={password}
            onChange={setPassword}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            minLength={6}
          />

          <Button type="submit" className="press-feedback w-full" disabled={busy}>
            {busy ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Just a moment…
              </>
            ) : (
              <>
                <Mail className="size-4" />
                {mode === "signin" ? "Continue with email" : "Create account"}
              </>
            )}
          </Button>
        </form>

        {sent && (
          <p className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
            We&apos;ve emailed you a confirmation link. Once you confirm, come back here and sign in.
          </p>
        )}

        {mode === "signin" && (
          <button
            type="button"
            onClick={() => void forgotPassword()}
            className="w-full text-center text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Forgot password?
          </button>
        )}
      </div>

      <button
        type="button"
        className="w-full text-center text-sm text-primary underline underline-offset-2"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
      >
        {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
      </button>

      <p className="text-center text-xs text-muted-foreground">
        Educational reference only — never a replacement for your doctor or pharmacist.
      </p>
    </div>
  );
}
