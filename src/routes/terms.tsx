import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ExplainButton } from "@/components/explain-button";
import { PronounceButtons } from "@/components/pronounce";
import { termsQuery } from "@/lib/queries";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Medical Dictionary — MediVault India" },
      {
        name: "description",
        content:
          "Medical and pharmacology terms explained in English, Hindi and Hinglish with pronunciation.",
      },
      { property: "og:title", content: "Medical Dictionary — MediVault India" },
      { property: "og:description", content: "Pharmacology terms in English, Hindi and Hinglish." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  const { data, isLoading } = useQuery(termsQuery());
  const [q, setQ] = useState("");
  const filtered = (data ?? []).filter((t) => t.term.toLowerCase().includes(q.toLowerCase().trim()));

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-bold">Medical Terms</h1>
        <p className="text-sm text-muted-foreground">{data?.length ?? 0} terms in the dictionary.</p>
      </header>
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a term…" aria-label="Search terms" />

      {isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : filtered.length === 0 ? (
        <p className="surface p-6 text-center text-sm text-muted-foreground">No term matches.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((t) => (
            <article key={t.id} className="surface p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-semibold">{t.term}</h2>
                  <p className="text-xs text-primary">{t.pronunciation_en}</p>
                </div>
                <div className="flex items-center gap-1">
                  {t.category && <Badge variant="outline">{t.category}</Badge>}
                  <PronounceButtons text={t.term} compact />
                </div>
              </div>
              <p className="mt-2 text-sm">{t.definition}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t.hindi_explanation}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t.hinglish_explanation}</p>
              <div className="mt-3">
                <ExplainButton topic={t.term} context={t.definition ?? ""} />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
