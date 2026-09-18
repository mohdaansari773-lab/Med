import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PronounceButtons } from "@/components/pronounce";
import { medicinesQuery } from "@/lib/queries";

export const Route = createFileRoute("/pronunciation")({
  head: () => ({
    meta: [
      { title: "Medicine Pronunciation — MediVault India" },
      {
        name: "description",
        content: "Hear and read English and Hindi-friendly pronunciations of common medicine names.",
      },
      { property: "og:title", content: "Pronunciation — MediVault India" },
      { property: "og:description", content: "English and Hindi-friendly medicine pronunciations." },
    ],
  }),
  component: PronunciationPage,
});

function PronunciationPage() {
  const { data, isLoading } = useQuery(medicinesQuery());
  const [q, setQ] = useState("");
  const list = (data ?? []).filter((m) => m.display_name.toLowerCase().includes(q.toLowerCase().trim()));

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-bold">Pronunciation</h1>
        <p className="text-sm text-muted-foreground">
          English, easy phonetic and Hindi-friendly forms. Audio uses your device&apos;s speech engine.
        </p>
      </header>
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a medicine…" aria-label="Find a medicine" />
      {isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {list.map((m) => (
            <article key={m.id} className="surface p-4">
              <h2 className="font-display font-semibold uppercase">{m.generic_name}</h2>
              <p className="mt-1 text-sm text-primary">{m.pronunciation_en}</p>
              <div className="mt-3">
                <PronounceButtons text={m.generic_name} />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
