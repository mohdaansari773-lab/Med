import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ExplainButton } from "@/components/explain-button";
import { medicinesQuery, medicineQuery } from "@/lib/queries";

export const Route = createFileRoute("/adme")({
  head: () => ({
    meta: [
      { title: "ADME & Pharmacokinetics — MediVault India" },
      {
        name: "description",
        content:
          "Absorption, distribution, metabolism and excretion explained simply, with per-medicine ADME data.",
      },
      { property: "og:title", content: "ADME — MediVault India" },
      { property: "og:description", content: "Learn ADME, pharmacokinetics and pharmacodynamics." },
    ],
  }),
  component: AdmePage,
});

const STEPS = [
  {
    step: "A",
    title: "Absorption",
    simple: "How the medicine gets into the blood.",
    student: "Movement of drug from the site of administration into systemic circulation; bioavailability is the key measure.",
  },
  {
    step: "D",
    title: "Distribution",
    simple: "Where the medicine travels in the body.",
    student: "Reversible transfer of drug between blood and tissues; described by volume of distribution and protein binding.",
  },
  {
    step: "M",
    title: "Metabolism",
    simple: "How the body changes the medicine.",
    student: "Biotransformation, mainly hepatic (phase I oxidation via CYP enzymes, phase II conjugation).",
  },
  {
    step: "E",
    title: "Excretion",
    simple: "How the medicine leaves the body.",
    student: "Removal of drug and metabolites, mainly renal and biliary; described by clearance and half-life.",
  },
];

function AdmePage() {
  const meds = useQuery(medicinesQuery());
  const [slug, setSlug] = useState("paracetamol");
  const { data: m, isLoading } = useQuery(medicineQuery(slug));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl font-bold">ADME</h1>
        <p className="text-sm text-muted-foreground">
          Pharmacokinetics is what the body does to the drug. Pharmacodynamics is what the drug does
          to the body.
        </p>
        <div className="mt-3 flex gap-2">
          <ExplainButton topic="ADME" />
          <ExplainButton topic="Pharmacodynamics" label="Pharmacodynamics" />
        </div>
      </header>

      <section className="mx-auto max-w-xl space-y-2">
        {STEPS.map((s, i) => (
          <div key={s.step}>
            <div className="surface p-4">
              <div className="flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
                  {s.step}
                </span>
                <h2 className="font-display font-semibold">{s.title}</h2>
              </div>
              <p className="mt-2 text-sm">{s.simple}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.student}</p>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex justify-center py-1 text-muted-foreground">
                <ArrowDown className="size-4" />
              </div>
            )}
          </div>
        ))}
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold">ADME for a medicine</h2>
        <div className="mb-3 flex flex-wrap gap-2">
          {(meds.data ?? []).slice(0, 12).map((x) => (
            <Button key={x.id} size="sm" variant={slug === x.slug ? "default" : "outline"} onClick={() => setSlug(x.slug)}>
              {x.display_name}
            </Button>
          ))}
        </div>
        {isLoading || !m ? (
          <Skeleton className="h-48 rounded-xl" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Absorption", m.absorption],
              ["Distribution", m.distribution],
              ["Metabolism", m.metabolism],
              ["Excretion", m.excretion],
              ["Half-life", m.half_life],
              ["Bioavailability", m.bioavailability],
              ["Protein binding", m.protein_binding],
              ["Clearance", m.clearance],
            ].map(([label, value]) => (
              <div key={label as string} className="surface p-4">
                <p className="text-xs font-medium text-muted-foreground">{label}</p>
                <p className="mt-1 text-sm">{(value as string) || "Not recorded."}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
