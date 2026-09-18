import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { ArrowLeft, Layers, ClipboardCheck, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ExplainButton } from "@/components/explain-button";
import { PronounceButtons } from "@/components/pronounce";
import { MedicineCard } from "@/components/medicine-card";
import { Disclaimer } from "@/components/disclaimer";
import { drugClassQuery, classMedicinesQuery, drugClassesQuery } from "@/lib/queries";
import { useTrackView } from "@/hooks/use-user-data";

export const Route = createFileRoute("/classes/$slug")({
  head: ({ params }) => {
    const name = params.slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return {
      meta: [
        { title: `${name} — Drug Class | MediVault India` },
        {
          name: "description",
          content: `${name}: definition, mechanism, uses, adverse effects and example medicines, explained simply and clinically.`,
        },
        { property: "og:title", content: `${name} — MediVault India` },
        { property: "og:description", content: `Learn the ${name} drug class with examples.` },
      ],
    };
  },
  component: ClassDetail,
});

function ClassDetail() {
  const { slug } = useParams({ from: "/classes/$slug" });
  const { data: c, isLoading } = useQuery(drugClassQuery(slug));
  const { data: meds } = useQuery(classMedicinesQuery(c?.id));
  const { data: all } = useQuery(drugClassesQuery());
  const track = useTrackView();

  useEffect(() => {
    if (c) void track("class", c.slug, c.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c?.id]);

  if (isLoading) return <Skeleton className="h-96 rounded-xl" />;
  if (!c)
    return (
      <div className="surface p-8 text-center">
        <h1 className="font-display text-xl font-semibold">Class not found</h1>
        <Button asChild className="mt-4">
          <Link to="/classes">Back to classes</Link>
        </Button>
      </div>
    );

  const parent = (all ?? []).find((p) => p.id === c.parent_id);
  const children = (all ?? []).filter((p) => p.parent_id === c.id);

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/classes">
          <ArrowLeft className="size-4" /> Classes
        </Link>
      </Button>

      <header className="surface p-5">
        <h1 className="font-display text-2xl font-bold uppercase">{c.name}</h1>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="capitalize">
            {c.class_type}
          </Badge>
          {c.key_suffix && <Badge variant="outline">{c.key_suffix}</Badge>}
          {parent && (
            <Link to="/classes/$slug" params={{ slug: parent.slug }}>
              <Badge variant="outline">↑ {parent.name}</Badge>
            </Link>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <PronounceButtons text={c.name} />
          <ExplainButton topic={c.name} context={c.clinical_definition ?? c.simple_explanation ?? ""} />
          <Button asChild variant="outline" size="sm">
            <Link to="/memory">
              <Brain className="size-4" /> Remember
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/flashcards">
              <Layers className="size-4" /> Flashcards
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/quiz">
              <ClipboardCheck className="size-4" /> Quiz
            </Link>
          </Button>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <Block title="Simple explanation" body={c.simple_explanation} />
        <Block title="Hindi / Hinglish" body={c.hindi_explanation} />
        <Block title="Medical definition" body={c.clinical_definition} />
        <Block title="Mechanism" body={c.mechanism} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <ListBlock title="Common uses" items={c.common_uses} />
        <ListBlock title="Important adverse effects" items={c.key_adverse_effects} />
        <ListBlock title="Contraindications" items={c.contraindications} />
        <ListBlock title="Advantages" items={c.advantages} />
        <ListBlock title="Disadvantages" items={c.disadvantages} />
      </div>

      {children.length > 0 && (
        <section>
          <h2 className="mb-2 font-display text-lg font-semibold">Subclasses</h2>
          <div className="flex flex-wrap gap-2">
            {children.map((s) => (
              <Button key={s.id} asChild variant="secondary" size="sm">
                <Link to="/classes/$slug" params={{ slug: s.slug }}>
                  {s.name}
                </Link>
              </Button>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold">Medicines in this class</h2>
        {(meds?.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">
            No medicine from the starter database is linked to this class yet.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {(meds ?? []).map((m) => (
              <MedicineCard key={m.id} m={m} />
            ))}
          </div>
        )}
      </section>

      <Disclaimer compact />
    </div>
  );
}

function Block({ title, body }: { title: string; body: string | null }) {
  return (
    <div className="surface p-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body || "Not recorded."}</p>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] | null }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="surface p-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
}
