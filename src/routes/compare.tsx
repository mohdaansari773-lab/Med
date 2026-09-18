import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Disclaimer } from "@/components/disclaimer";
import { medicinesQuery, medicineQuery } from "@/lib/queries";

const searchSchema = z.object({ a: z.string().optional() });

export const Route = createFileRoute("/compare")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Compare Medicines — MediVault India" },
      {
        name: "description",
        content:
          "Compare two medicines side by side: class, mechanism, ADME, uses, adverse effects and interactions.",
      },
      { property: "og:title", content: "Compare Medicines — MediVault India" },
      { property: "og:description", content: "Educational side-by-side medicine comparison." },
    ],
  }),
  component: ComparePage,
});

type Med = Record<string, unknown>;

const ROWS: [string, string][] = [
  ["Generic", "generic_name"],
  ["Salt", "salt"],
  ["Category", "category"],
  ["Mechanism", "mechanism_of_action"],
  ["Absorption", "absorption"],
  ["Metabolism", "metabolism"],
  ["Excretion", "excretion"],
  ["Half-life", "half_life"],
  ["Bioavailability", "bioavailability"],
  ["Pregnancy", "pregnancy"],
  ["Renal", "renal"],
  ["Hepatic", "hepatic"],
];

function useMedicine(slug: string) {
  return useQuery(medicineQuery(slug)).data;
}

function ComparePage() {
  const { a } = Route.useSearch();
  const meds = useQuery(medicinesQuery());
  const [left, setLeft] = useState(a ?? "paracetamol");
  const [right, setRight] = useState("ibuprofen");
  const l = useMedicine(left);
  const r = useMedicine(right);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-bold">Compare Medicines</h1>
        <p className="text-sm text-muted-foreground">
          Educational comparison only. This does not recommend which medicine any individual should
          take.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { value: left, set: setLeft, label: "Medicine A" },
          { value: right, set: setRight, label: "Medicine B" },
        ].map((col) => (
          <div key={col.label}>
            <p className="mb-2 text-xs font-medium text-muted-foreground">{col.label}</p>
            <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto">
              {(meds.data ?? []).map((m) => (
                <Button
                  key={m.id}
                  size="sm"
                  variant={col.value === m.slug ? "default" : "outline"}
                  onClick={() => col.set(m.slug)}
                >
                  {m.display_name}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {!l || !r ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : (
        <div className="surface overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-3 text-left font-medium">Field</th>
                <th className="p-3 text-left font-semibold">{l.display_name}</th>
                <th className="p-3 text-left font-semibold">{r.display_name}</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map(([label, key]) => (
                <tr key={label} className="border-b align-top last:border-0">
                  <td className="p-3 text-xs font-medium text-muted-foreground">{label}</td>
                  <td className="p-3">{(((l as Med)[key] as string) ?? "") || "—"}</td>
                  <td className="p-3">{(((r as Med)[key] as string) ?? "") || "—"}</td>
                </tr>
              ))}
              <tr className="align-top">
                <td className="p-3 text-xs font-medium text-muted-foreground">Common adverse effects</td>
                <td className="p-3">{(l.common_adverse_effects ?? []).join(", ") || "—"}</td>
                <td className="p-3">{(r.common_adverse_effects ?? []).join(", ") || "—"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <Disclaimer />
    </div>
  );
}
