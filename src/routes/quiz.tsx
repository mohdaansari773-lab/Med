import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { quizQuery } from "@/lib/queries";
import { useRecordProgress } from "@/hooks/use-user-data";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "Pharmacology Quiz — MediVault India" },
      {
        name: "description",
        content:
          "Test your pharmacology knowledge: drug classes, mechanisms, ADME and medical terms.",
      },
      { property: "og:title", content: "Quiz — MediVault India" },
      { property: "og:description", content: "10 and 20 question pharmacology quizzes." },
    ],
  }),
  component: QuizPage,
});

function QuizPage() {
  const { data, isLoading } = useQuery(quizQuery());
  const record = useRecordProgress();
  const [length, setLength] = useState(10);
  const [started, setStarted] = useState(false);
  const [topic, setTopic] = useState<string>("all");
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const topics = useMemo(() => [...new Set((data ?? []).map((q) => q.topic))], [data]);
  const pool = useMemo(() => {
    if (!started) return [];
    const src = (data ?? []).filter((q) => topic === "all" || q.topic === topic);
    return [...src].sort(() => Math.random() - 0.5).slice(0, length);
  }, [data, topic, length, started]);

  if (isLoading) return <Skeleton className="h-72 rounded-xl" />;

  if (!started)
    return (
      <div className="mx-auto max-w-xl space-y-5">
        <h1 className="font-display text-2xl font-bold">Quiz</h1>
        <div className="surface space-y-4 p-5">
          <div>
            <p className="mb-2 text-sm font-medium">Length</p>
            <div className="flex gap-2">
              {[10, 20].map((n) => (
                <Button
                  key={n}
                  size="sm"
                  variant={length === n ? "default" : "outline"}
                  onClick={() => setLength(n)}
                >
                  {n} questions
                </Button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Topic</p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={topic === "all" ? "default" : "outline"}
                onClick={() => setTopic("all")}
              >
                All topics
              </Button>
              {topics.map((t) => (
                <Button
                  key={t}
                  size="sm"
                  variant={topic === t ? "default" : "outline"}
                  onClick={() => setTopic(t)}
                >
                  {t}
                </Button>
              ))}
            </div>
          </div>
          <Button
            className="w-full"
            onClick={() => {
              setStarted(true);
              setIdx(0);
              setScore(0);
              setPicked(null);
            }}
          >
            Start quiz
          </Button>
        </div>
      </div>
    );

  if (idx >= pool.length) {
    return (
      <div className="mx-auto max-w-xl space-y-4 text-center">
        <h1 className="font-display text-2xl font-bold">Quiz complete</h1>
        <p className="font-display text-5xl font-bold text-primary">
          {score}/{pool.length}
        </p>
        <Button
          onClick={() => {
            record.mutate({ activity_type: "quiz", topic, score, total: pool.length });
            setStarted(false);
          }}
        >
          Save &amp; finish
        </Button>
      </div>
    );
  }

  const q = pool[idx]!;
  const correct = picked === q.correct_answer;

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <Progress value={((idx + 1) / pool.length) * 100} />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Question {idx + 1} of {pool.length}
        </span>
        <Badge variant="secondary">{q.topic}</Badge>
      </div>
      <h2 className="font-display text-lg font-semibold">{q.question}</h2>
      <div className="space-y-2">
        {q.options.map((o) => (
          <Button
            key={o}
            variant={
              picked === null
                ? "outline"
                : o === q.correct_answer
                  ? "default"
                  : picked === o
                    ? "destructive"
                    : "outline"
            }
            className="h-auto w-full justify-start py-3 text-left whitespace-normal"
            disabled={picked !== null}
            onClick={() => {
              setPicked(o);
              if (o === q.correct_answer) setScore((s) => s + 1);
            }}
          >
            {o}
          </Button>
        ))}
      </div>
      {picked && (
        <div className="surface space-y-2 p-4 text-sm">
          <p className="font-semibold">{correct ? "Correct" : "Incorrect"}</p>
          <p className="text-muted-foreground">
            Answer: {q.correct_answer}. {q.explanation}
          </p>
          <Button
            size="sm"
            onClick={() => {
              setPicked(null);
              setIdx((n) => n + 1);
            }}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
