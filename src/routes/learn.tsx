import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Disclaimer } from "@/components/disclaimer";
import { LEARNING_PATH } from "@/lib/learning-path";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Pharmacology Learning Path — MediVault India" },
      {
        name: "description",
        content:
          "A structured pharmacology learning path from beginner foundations to system-wise student topics. Every topic opens in AI Study Mode.",
      },
      { property: "og:title", content: "Pharmacology Learning Path — MediVault India" },
      {
        property: "og:description",
        content: "Beginner to student pharmacology, topic by topic.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LearnPage,
});

function LearnPage() {
  return (
    <div className="animate-fade-up space-y-8">
      <header>
        <Badge variant="secondary" className="mb-2">
          Learning Path
        </Badge>
        <h1 className="font-display text-2xl font-bold">Learn pharmacology step by step</h1>
        <p className="text-sm text-muted-foreground">
          Work through the foundations first, then move into system-wise pharmacology. Tap any topic
          to study it with the AI tutor.
        </p>
      </header>

      {LEARNING_PATH.map((stage) => (
        <section key={stage.id} className="space-y-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="size-5 text-primary" aria-hidden />
            <h2 className="font-display text-lg font-semibold">{stage.title}</h2>
          </div>
          <p className="text-sm text-muted-foreground">{stage.description}</p>

          <ol className="grid gap-2 sm:grid-cols-2">
            {stage.topics.map((t, i) => (
              <li key={t.title}>
                <Link
                  to="/study"
                  search={{ topic: t.title }}
                  className="surface press-feedback flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-accent"
                >
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-muted text-xs font-medium">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{t.title}</span>
                    <span className="block text-xs text-muted-foreground">{t.blurb}</span>
                  </span>
                  <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground" aria-hidden />
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ))}

      <Disclaimer compact />
    </div>
  );
}
