import { useState } from "react";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Disclaimer } from "@/components/disclaimer";
import { STUDY_MODES, type StudyMode } from "@/lib/ai-study";
import { studyWithAi } from "@/lib/ai.functions";

type Search = { topic?: string };

export const Route = createFileRoute("/study")({
  validateSearch: (s: Record<string, unknown>): Search =>
    typeof s['topic'] === "string" ? { topic: s['topic'].slice(0, 120) } : {},
  head: () => ({
    meta: [
      { title: "Study with AI — MediVault India" },
      {
        name: "description",
        content:
          "Learn any medicine, drug class or pharmacology topic step by step with quizzes, flashcards and mnemonics grounded in the MediVault reference database.",
      },
      { property: "og:title", content: "Study with AI — MediVault India" },
      {
        property: "og:description",
        content: "Explain, quiz, flashcard, mnemonic, simplify, compare and revise any topic.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StudyPage,
});

function StudyPage() {
  const search = useSearch({ from: "/study" });
  const [topic, setTopic] = useState(search.topic ?? "");
  const [mode, setMode] = useState<StudyMode>("explain");
  const [text, setText] = useState("");
  const [grounded, setGrounded] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const run = useServerFn(studyWithAi);

  async function go(m: StudyMode) {
    const t = topic.trim();
    if (t.length < 2) return;
    setMode(m);
    setLoading(true);
    setText("");
    setGrounded(null);
    try {
      const res = await run({ data: { topic: t, mode: m, extraContext: "" } });
      setText(res.text);
      setGrounded("grounded" in res ? Boolean(res.grounded) : null);
    } catch {
      setText("The study assistant could not be reached. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-up space-y-6">
      <header>
        <Badge variant="secondary" className="mb-2">
          AI Study Mode
        </Badge>
        <h1 className="font-display text-2xl font-bold">Study with AI</h1>
        <p className="text-sm text-muted-foreground">
          Pick a medicine, drug class or pharmacology topic. The assistant first looks up the
          MediVault record, then teaches from it.
        </p>
      </header>

      <div className="surface space-y-4 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void go(mode);
          }}
          className="flex flex-col gap-2 sm:flex-row"
        >
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Beta blockers, Paracetamol, ADME of metformin"
            aria-label="Study topic"
          />
          <Button type="submit" disabled={loading || topic.trim().length < 2} className="press-feedback">
            <Sparkles className="size-4" /> Start
          </Button>
        </form>

        <div className="flex flex-wrap gap-2">
          {STUDY_MODES.map((m) => (
            <Button
              key={m.key}
              size="sm"
              variant={mode === m.key ? "default" : "outline"}
              disabled={loading || topic.trim().length < 2}
              onClick={() => void go(m.key)}
              title={m.hint}
              className="press-feedback"
            >
              {m.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="surface min-h-40 p-4 text-sm leading-relaxed whitespace-pre-wrap">
        {loading ? (
          <span className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Preparing your study material…
          </span>
        ) : text ? (
          <>
            {grounded === false && (
              <p className="mb-3 rounded-md bg-muted p-2 text-xs text-muted-foreground">
                No matching record was found in the MediVault database, so this is general textbook
                teaching — treat it as unverified.
              </p>
            )}
            {text}
          </>
        ) : (
          <p className="text-muted-foreground">
            Enter a topic above and choose a study mode — Explain, Quiz Me, Flashcard Me, Give
            Mnemonic, Simplify, Compare or Revise.
          </p>
        )}
      </div>

      <Disclaimer compact />
    </div>
  );
}
