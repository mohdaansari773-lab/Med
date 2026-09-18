import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Check, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { flashcardsQuery } from "@/lib/queries";
import { useReviewSchedule, useRecordProgress } from "@/hooks/use-user-data";

export const Route = createFileRoute("/flashcards")({
  head: () => ({
    meta: [
      { title: "Pharmacology Flashcards — MediVault India" },
      {
        name: "description",
        content: "Study pharmacology with flashcards and a simple spaced-repetition review schedule.",
      },
      { property: "og:title", content: "Flashcards — MediVault India" },
      { property: "og:description", content: "Spaced-repetition pharmacology flashcards." },
    ],
  }),
  component: FlashcardsPage,
});

function FlashcardsPage() {
  const { data, isLoading } = useQuery(flashcardsQuery());
  const { record, dueToday } = useReviewSchedule();
  const progress = useRecordProgress();
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (isLoading) return <Skeleton className="h-72 rounded-xl" />;
  const cards = data ?? [];
  if (cards.length === 0)
    return <p className="surface p-6 text-center text-sm">No flashcards available yet.</p>;

  const card = cards[i % cards.length]!;

  function answer(outcome: "know" | "review" | "dont-know") {
    record.mutate({ flashcardId: card.id, outcome });
    progress.mutate({ activity_type: "flashcard", topic: card.topic, item_id: card.id });
    setFlipped(false);
    setI((n) => n + 1);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Flashcards</h1>
          <p className="text-sm text-muted-foreground">
            Card {(i % cards.length) + 1} of {cards.length} • {dueToday.length} due today
          </p>
        </div>
        <Badge variant="secondary">{card.topic}</Badge>
      </header>

      <button
        onClick={() => setFlipped((f) => !f)}
        className="surface flex min-h-56 w-full flex-col items-center justify-center gap-3 p-8 text-center"
      >
        <p className="font-display text-lg font-semibold">{card.question}</p>
        {flipped ? (
          <p className="text-primary">{card.answer}</p>
        ) : (
          <p className="text-xs text-muted-foreground">Tap to reveal the answer</p>
        )}
      </button>

      <div className="grid grid-cols-3 gap-2">
        <Button variant="outline" onClick={() => answer("know")}>
          <Check className="size-4" /> Know
        </Button>
        <Button variant="outline" onClick={() => answer("review")}>
          <RotateCcw className="size-4" /> Review
        </Button>
        <Button variant="outline" onClick={() => answer("dont-know")}>
          <X className="size-4" /> Don&apos;t know
        </Button>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Sign in to save your review schedule and progress.
      </p>
    </div>
  );
}
