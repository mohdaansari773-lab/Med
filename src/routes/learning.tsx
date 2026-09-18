import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import {
  useLearningProgress,
  useRecentlyViewed,
  useReviewSchedule,
  useFavorites,
} from "@/hooks/use-user-data";

export const Route = createFileRoute("/learning")({
  head: () => ({
    meta: [
      { title: "My Learning — MediVault India" },
      {
        name: "description",
        content: "Track medicines learned, quiz scores, flashcard reviews and your study streak.",
      },
      { property: "og:title", content: "My Learning — MediVault India" },
      { property: "og:description", content: "Your pharmacology learning dashboard." },
    ],
  }),
  component: LearningPage,
});

function LearningPage() {
  const { user } = useAuth();
  const { data: progress } = useLearningProgress();
  const recent = useRecentlyViewed();
  const { schedule, dueToday } = useReviewSchedule();
  const { favorites } = useFavorites();

  if (!user)
    return (
      <div className="surface mx-auto max-w-md p-8 text-center">
        <h1 className="font-display text-xl font-semibold">Sign in to track learning</h1>
        <Button asChild className="mt-4">
          <Link to="/auth">Sign in</Link>
        </Button>
      </div>
    );

  const quizzes = (progress ?? []).filter((p) => p.activity_type === "quiz");
  const cards = (progress ?? []).filter((p) => p.activity_type === "flashcard");
  const avg =
    quizzes.length > 0
      ? Math.round(
          (quizzes.reduce((s, q) => s + (q.score ?? 0) / Math.max(q.total ?? 1, 1), 0) / quizzes.length) * 100,
        )
      : 0;
  const medicinesSeen = new Set(
    (recent.data ?? []).filter((r) => r.item_type === "medicine").map((r) => r.item_id),
  ).size;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">My Learning</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Medicines visited" value={medicinesSeen} />
        <Stat label="Flashcards studied" value={cards.length} />
        <Stat label="Quizzes taken" value={quizzes.length} />
        <Stat label="Review today" value={dueToday.length} />
      </div>

      <section className="surface p-5">
        <p className="text-sm font-medium">Average quiz score</p>
        <Progress value={avg} className="mt-2" />
        <p className="mt-1 text-xs text-muted-foreground">{avg}%</p>
      </section>

      <section className="surface p-5">
        <h2 className="font-display font-semibold">Recent activity</h2>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          {(progress ?? []).slice(0, 10).map((p) => (
            <li key={p.id}>
              {p.activity_type} · {p.topic ?? "general"}
              {p.total ? ` · ${p.score}/${p.total}` : ""} ·{" "}
              {new Date(p.completed_at).toLocaleDateString()}
            </li>
          ))}
          {(progress ?? []).length === 0 && <li>No activity yet — try a quiz or flashcards.</li>}
        </ul>
      </section>

      <section className="surface p-5">
        <h2 className="font-display font-semibold">Saved &amp; scheduled</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {favorites.length} favourites • {schedule.length} cards in the review schedule
        </p>
        <div className="mt-3 flex gap-2">
          <Button asChild size="sm">
            <Link to="/flashcards">Review now</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/favorites">Favourites</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="surface p-4">
      <p className="font-display text-2xl font-bold text-primary">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
