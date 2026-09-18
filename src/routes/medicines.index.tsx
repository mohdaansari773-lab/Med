import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MedicineCard } from "@/components/medicine-card";
import { Disclaimer } from "@/components/disclaimer";
import { medicinesQuery } from "@/lib/queries";
import { DATASET_LABEL } from "@/lib/constants";

export const Route = createFileRoute("/medicines/")({
  head: () => ({
    meta: [
      { title: "Medicines — MediVault India" },
      {
        name: "description",
        content:
          "Browse the starter database of commonly used medicines in India by category, generic name and salt.",
      },
      { property: "og:title", content: "Medicines — MediVault India" },
      {
        property: "og:description",
        content: "Browse commonly used medicines by category, generic name and salt.",
      },
    ],
  }),
  component: MedicinesPage,
});

function MedicinesPage() {
  const { data, isLoading, isError } = useQuery(medicinesQuery());
  const [term, setTerm] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const categories = useMemo(
    () => [...new Set((data ?? []).map((m) => m.category).filter(Boolean))] as string[],
    [data],
  );

  const filtered = (data ?? []).filter((m) => {
    const t = term.toLowerCase().trim();
    const matches =
      !t ||
      m.display_name.toLowerCase().includes(t) ||
      m.generic_name.toLowerCase().includes(t) ||
      (m.salt ?? "").toLowerCase().includes(t);
    return matches && (!category || m.category === category);
  });

  return (
    <div className="space-y-6">
      <header>
        <Badge variant="secondary" className="mb-2">
          {DATASET_LABEL}
        </Badge>
        <h1 className="font-display text-2xl font-bold">Medicines</h1>
        <p className="text-sm text-muted-foreground">
          {data?.length ?? 0} records ·{" "}
          {(data ?? []).filter((m) => m.verification_status === "verified").length} verified ·{" "}
          {(data ?? []).filter((m) => m.verification_status !== "verified").length} under review.
          This is not a list of all medicines available in India.
        </p>

      </header>

      <Input
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Filter by generic name or salt…"
        aria-label="Filter medicines"
      />

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={category === null ? "default" : "outline"}
          onClick={() => setCategory(null)}
        >
          All
        </Button>
        {categories.map((c) => (
          <Button
            key={c}
            size="sm"
            variant={category === c ? "default" : "outline"}
            onClick={() => setCategory(c)}
          >
            {c}
          </Button>
        ))}
      </div>

      {isError ? (
        <p className="surface p-6 text-sm">
          The medicine database could not be reached. Please check your connection and refresh.
        </p>
      ) : isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="surface p-6 text-center text-sm text-muted-foreground">
          No medicine matches that filter in the starter database.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((m) => (
            <MedicineCard key={m.id} m={m} />
          ))}
        </div>
      )}

      <Disclaimer compact />
    </div>
  );
}
