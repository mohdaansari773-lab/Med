import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { suffixesQuery, mnemonicsQuery, medicinesQuery } from "@/lib/queries";

export const Route = createFileRoute("/memory")({
  head: () => ({
    meta: [
      { title: "Drug Memory & Name Patterns — MediVault India" },
      {
        name: "description",
        content:
          "Learn drug classes faster with safe mnemonics and drug-name suffix patterns such as -pril, -sartan and -statin.",
      },
      { property: "og:title", content: "Drug Memory — MediVault India" },
      { property: "og:description", content: "Mnemonics and drug-name suffix patterns." },
    ],
  }),
  component: MemoryPage,
});

function MemoryPage() {
  const suffixes = useQuery(suffixesQuery());
  const mnemonics = useQuery(mnemonicsQuery());
  const meds = useQuery(medicinesQuery());
  const tricks = (meds.data ?? []).filter((m) => m.key_suffix);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl font-bold">Drug Memory</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Learning aids for pharmacology. Mnemonics are learning aids — always verify the actual
          classification in the medicine record.
        </p>
      </header>

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold">Drug Name Patterns</h2>
        {suffixes.isLoading ? (
          <Skeleton className="h-48 rounded-xl" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {(suffixes.data ?? []).map((s) => (
              <div key={s.id} className="surface p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display text-lg font-semibold text-primary">{s.suffix}</h3>
                  {s.class_hint && <Badge variant="secondary">{s.class_hint}</Badge>}
                </div>
                <p className="mt-1 text-sm">{s.meaning}</p>
                <p className="mt-1 text-xs text-muted-foreground">{(s.examples ?? []).join(" • ")}</p>
                <p className="mt-2 text-[11px] text-muted-foreground">{s.note}</p>
              </div>
            ))}
          </div>
        )}
        <p className="mt-3 rounded-lg bg-warning/10 p-3 text-xs text-warning-foreground">
          Drug-name suffixes are memory aids, not absolute classification rules. Exceptions exist.
        </p>
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold">Mnemonics</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {(mnemonics.data ?? []).map((m) => (
            <div key={m.id} className="surface p-4">
              <h3 className="font-semibold">{m.title}</h3>
              <p className="mt-1 text-sm">{m.content}</p>
              <p className="mt-1 text-xs text-muted-foreground">{m.explanation}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold">Per-medicine memory tricks</h2>
        <div className="flex flex-wrap gap-2">
          {tricks.map((m) => (
            <Button key={m.id} asChild size="sm" variant="outline">
              <Link to="/medicines/$slug" params={{ slug: m.slug }}>
                {m.display_name} · {m.key_suffix}
              </Link>
            </Button>
          ))}
        </div>
      </section>
    </div>
  );
}
