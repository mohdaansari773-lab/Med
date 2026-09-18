import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useQuery as useQ } from "@tanstack/react-query";
import { drugClassesQuery } from "@/lib/queries";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ExplainButton } from "@/components/explain-button";

export const Route = createFileRoute("/classes/")({
  head: () => ({
    meta: [
      { title: "Drug Classes & Classification — MediVault India" },
      {
        name: "description",
        content:
          "Browse therapeutic and pharmacological drug classes with simple, Hindi and clinical explanations.",
      },
      { property: "og:title", content: "Drug Classes — MediVault India" },
      {
        property: "og:description",
        content: "Therapeutic and pharmacological classification explained simply.",
      },
    ],
  }),
  component: ClassesPage,
});

function ClassesPage() {
  const { data, isLoading } = useQuery(drugClassesQuery());
  const therapeutic = (data ?? []).filter((c) => c.class_type === "therapeutic");
  const pharmacological = (data ?? []).filter((c) => c.class_type !== "therapeutic");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold">Classification</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Classification means grouping medicines according to their therapeutic use,
          pharmacological action, mechanism, chemical structure or other standardised criteria.
        </p>
        <div className="mt-3">
          <ExplainButton topic="Drug classification" />
        </div>
      </header>

      {isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : (
        <div className="space-y-8">
          <Group title="Therapeutic Classes" items={therapeutic} />
          <Group title="Pharmacological Classes" items={pharmacological} />
        </div>
      )}
    </div>
  );
}

function Group({
  title,
  items,
}: {
  title: string;
  items: {
    id: string;
    slug: string;
    name: string;
    simple_explanation: string | null;
    key_suffix: string | null;
  }[];
}) {
  return (
    <section>
      <h2 className="mb-3 font-display text-lg font-semibold">{title}</h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((c) => (
          <Link
            key={c.id}
            to="/classes/$slug"
            params={{ slug: c.slug }}
            className="surface block p-4 transition-shadow hover:shadow-[var(--shadow-float)]"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold">{c.name}</h3>
              {c.key_suffix && <Badge variant="outline">{c.key_suffix}</Badge>}
            </div>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {c.simple_explanation}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
