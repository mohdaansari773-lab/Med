import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type ThemeMode = "light" | "dark" | "system";
export type Language = "en" | "hi" | "hinglish";
export type LearningLevel = "beginner" | "student" | "healthcare" | "professional";
export type SpeechSpeed = "normal" | "slow";

export type Preferences = {
  theme: ThemeMode;
  language: Language;
  learningLevel: LearningLevel;
  speechSpeed: SpeechSpeed;
  learningReminders: boolean;
  reviewReminders: boolean;
};

const DEFAULTS: Preferences = {
  theme: "system",
  language: "en",
  learningLevel: "beginner",
  speechSpeed: "normal",
  learningReminders: false,
  reviewReminders: false,
};

const STORAGE_KEY = "medivault.prefs";

function readStored(): Preferences {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // migrate legacy theme key
      const legacy = window.localStorage.getItem("medivault.theme");
      return legacy === "dark" || legacy === "light" ? { ...DEFAULTS, theme: legacy } : DEFAULTS;
    }
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Preferences>) };
  } catch {
    return DEFAULTS;
  }
}

function applyTheme(theme: ThemeMode) {
  if (typeof document === "undefined") return;
  const dark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

type Ctx = {
  prefs: Preferences;
  setPref: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
  isDark: boolean;
  toggleTheme: () => void;
  hydrated: boolean;
};

const PreferencesContext = createContext<Ctx>({
  prefs: DEFAULTS,
  setPref: () => {},
  isDark: false,
  toggleTheme: () => {},
  hydrated: false,
});

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = readStored();
    setPrefs(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    applyTheme(prefs.theme);
    setIsDark(document.documentElement.classList.contains("dark"));
    if (prefs.theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      applyTheme("system");
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [prefs, hydrated]);

  const value = useMemo<Ctx>(
    () => ({
      prefs,
      hydrated,
      isDark,
      setPref: (key, val) => setPrefs((p) => ({ ...p, [key]: val })),
      toggleTheme: () => setPrefs((p) => ({ ...p, theme: isDark ? "light" : "dark" })),
    }),
    [prefs, hydrated, isDark],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export const usePreferences = () => useContext(PreferencesContext);

/** Speech rate used by pronunciation buttons, read outside React too. */
export function storedSpeechRate(base = 1): number {
  if (typeof window === "undefined") return base;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const p = JSON.parse(raw) as Partial<Preferences>;
    return p.speechSpeed === "slow" ? Math.min(base, 1) * 0.6 : base;
  } catch {
    return base;
  }
}
