import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/password-field";
import { supabase } from "@/integrations/supabase/client";
import { friendlyAuthError } from "@/lib/auth-messages";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a New Password — MediVault India" },
      {
        name: "description",
        content: "Choose a new password for your MediVault India learning account.",
      },
      { property: "og:title", content: "Set a New Password — MediVault India" },
      { property: "og:description", content: "Securely update your MediVault India password." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Those two passwords don't match. Please re-enter them.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error(friendlyAuthError(error));
      return;
    }
    toast.success("Password updated. You're all set.");
    void navigate({ to: "/", replace: true });
  }

  return (
    <div className="animate-fade-up mx-auto max-w-sm space-y-5 py-6">
      <header className="text-center">
        <span className="mx-auto mb-3 grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground">
          <KeyRound className="size-5" aria-hidden />
        </span>
        <h1 className="font-display text-2xl font-bold">Set a new password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Open this page from the reset link in your email, then choose a new password.
        </p>
      </header>

      <form onSubmit={submit} className="surface space-y-3 p-5">
        <PasswordField
          id="new-password"
          label="New password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
        />
        <PasswordField
          id="confirm-password"
          label="Confirm new password"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
        />
        <Button type="submit" className="press-feedback w-full" disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          Update password
        </Button>
      </form>
    </div>
  );
}
