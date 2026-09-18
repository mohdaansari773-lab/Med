import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  User,
  Palette,
  Languages,
  GraduationCap,
  Volume2,
  Bell,
  ShieldCheck,
  Info,
  LogOut,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { usePreferences, type LearningLevel, type Language, type ThemeMode } from "@/hooks/use-preferences";
import { supabase } from "@/integrations/supabase/client";
import { APP_NAME, APP_VERSION, DATABASE_VERSION } from "@/lib/constants";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — MediVault India" },
      {
        name: "description",
        content:
          "Manage your MediVault India account, appearance, language, learning level, pronunciation speed, reminders and privacy controls.",
      },
      { property: "og:title", content: "Settings — MediVault India" },
      {
        property: "og:description",
        content: "Personalise appearance, language, learning level and privacy in MediVault India.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const { prefs, setPref } = usePreferences();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    toast.success("You're signed out.");
    void navigate({ to: "/auth", replace: true });
  }

  async function clearRecent(): Promise<void> {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("recently_viewed").delete().eq("user_id", user.id);
    setBusy(false);
    if (error) {
      toast.error("We couldn't clear that right now. Please try again.");
      return;
    }
    void qc.invalidateQueries({ queryKey: ["recent"] });
    toast.success("Recently viewed cleared.");
  }

  async function clearLearning(): Promise<void> {
    if (!user) return;
    setBusy(true);
    const a = await supabase.from("learning_progress").delete().eq("user_id", user.id);
    const b = await supabase.from("review_schedule").delete().eq("user_id", user.id);
    setBusy(false);
    if (a.error || b.error) {
      toast.error("We couldn't clear your history right now. Please try again.");
      return;
    }
    void qc.invalidateQueries({ queryKey: ["progress"] });
    void qc.invalidateQueries({ queryKey: ["reviews"] });
    toast.success("Learning history cleared.");
  }

  return (
    <div className="animate-fade-up mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Make {APP_NAME} work the way you learn. Everything here saves instantly on this device.
        </p>
      </header>

      <SettingsCard icon={User} title="Account">
        {user ? (
          <div className="space-y-3">
            <Row label="Email" value={user.email ?? "—"} />
            <Row label="Profile" value={user.user_metadata?.["full_name"] ?? "No display name set"} />
            <Button variant="outline" size="sm" onClick={() => void signOut()}>
              <LogOut className="size-4" /> Sign out
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              You&apos;re browsing as a guest. Sign in to sync favourites, progress and reviews.
            </p>
            <Button asChild size="sm">
              <Link to="/auth">Sign in or create an account</Link>
            </Button>
          </div>
        )}
      </SettingsCard>

      <SettingsCard icon={Palette} title="Appearance">
        <Choice<ThemeMode>
          name="theme"
          value={prefs.theme}
          onChange={(v) => setPref("theme", v)}
          options={[
            { value: "light", label: "Light mode" },
            { value: "dark", label: "Dark mode" },
            { value: "system", label: "System default" },
          ]}
        />
      </SettingsCard>

      <SettingsCard icon={Languages} title="Language">
        <p className="mb-2 text-sm text-muted-foreground">
          Sets the default style used by AI Explain and term helpers.
        </p>
        <Choice<Language>
          name="language"
          value={prefs.language}
          onChange={(v) => setPref("language", v)}
          options={[
            { value: "en", label: "English" },
            { value: "hi", label: "Hindi" },
            { value: "hinglish", label: "Hinglish" },
          ]}
        />
      </SettingsCard>

      <SettingsCard icon={GraduationCap} title="Learning level">
        <p className="mb-2 text-sm text-muted-foreground">
          We use this to pitch explanations at the right depth.
        </p>
        <Choice<LearningLevel>
          name="level"
          value={prefs.learningLevel}
          onChange={(v) => setPref("learningLevel", v)}
          options={[
            { value: "beginner", label: "Beginner" },
            { value: "student", label: "Student" },
            { value: "healthcare", label: "Healthcare learner" },
            { value: "professional", label: "Professional reference" },
          ]}
        />
      </SettingsCard>

      <SettingsCard icon={Volume2} title="Pronunciation">
        <Choice
          name="speech"
          value={prefs.speechSpeed}
          onChange={(v) => setPref("speechSpeed", v)}
          options={[
            { value: "normal" as const, label: "Normal speed" },
            { value: "slow" as const, label: "Slow speed" },
          ]}
        />
      </SettingsCard>

      <SettingsCard icon={Bell} title="Notifications">
        <Toggle
          id="learning-reminders"
          label="Learning reminders"
          hint="A nudge to study when you haven't opened a medicine in a while."
          checked={prefs.learningReminders}
          onChange={(v) => setPref("learningReminders", v)}
        />
        <Separator className="my-3" />
        <Toggle
          id="review-reminders"
          label="Review reminders"
          hint="Highlight flashcards that are due today on your home screen."
          checked={prefs.reviewReminders}
          onChange={(v) => setPref("reviewReminders", v)}
        />
      </SettingsCard>

      <SettingsCard icon={ShieldCheck} title="Privacy">
        {user ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" disabled={busy} onClick={() => void clearRecent()}>
              <Trash2 className="size-4" /> Clear recently viewed
            </Button>
            <Button variant="outline" size="sm" disabled={busy} onClick={() => void clearLearning()}>
              <Trash2 className="size-4" /> Clear learning history
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nothing personal is stored while you&apos;re signed out — only your preferences on this
            device.
          </p>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          Your favourites, history and progress are private to your account. To delete your account
          entirely, contact support from the email you signed up with.
        </p>
      </SettingsCard>

      <SettingsCard icon={Info} title="About">
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link to="/about">About {APP_NAME}</Link>
          </Button>
          <p className="text-xs text-muted-foreground">
            v{APP_VERSION} • Database v{DATABASE_VERSION}
          </p>
        </div>
      </SettingsCard>
    </div>
  );
}

function SettingsCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof User;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="surface p-5">
      <h2 className="mb-3 flex items-center gap-2 font-display text-base font-semibold">
        <Icon className="size-4 text-primary" aria-hidden /> {title}
      </h2>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  );
}

function Choice<T extends string>({
  name,
  value,
  onChange,
  options,
}: {
  name: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <RadioGroup
      value={value}
      onValueChange={(v) => onChange(v as T)}
      className="grid gap-2 sm:grid-cols-2"
    >
      {options.map((o) => (
        <Label
          key={o.value}
          htmlFor={`${name}-${o.value}`}
          className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-colors hover:bg-accent has-[:checked]:border-primary"
        >
          <RadioGroupItem id={`${name}-${o.value}`} value={o.value} />
          {o.label}
        </Label>
      ))}
    </RadioGroup>
  );
}

function Toggle({
  id,
  label,
  hint,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} aria-label={label} />
    </div>
  );
}
