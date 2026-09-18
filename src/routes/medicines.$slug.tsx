import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Star, Scale, Brain, ShieldCheck, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ExplainButton } from "@/components/explain-button";
import { PronounceButtons } from "@/components/pronounce";
import { Disclaimer } from "@/components/disclaimer";
import { MedicalTermHelp } from "@/components/medical-term-help";
import { VerificationBadge } from "@/components/verification-badge";
import {
  medicineQuery,
  medicineBrandsQuery,
  medicineClassesQuery,
  medicineReferencesQuery,
  medicineInteractionsQuery,
} from "@/lib/queries";
import { useFavorites, useTrackView } from "@/hooks/use-user-data";

export const Route = createFileRoute("/medicines/$slug")({
  head: ({ params }) => {
    const name = params.slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return {
      meta: [
        { title: `${name} — Medicine Profile | MediVault India` },
        {
          name: "description",
          content: `${name}: classification, mechanism of action, ADME, pharmacokinetics, uses, warnings and adverse effects — educational reference.`,
        },
        { property: "og:title", content: `${name} — MediVault India` },
        {
          property: "og:description",
          content: `Pharmacology reference for ${name}: class, mechanism, ADME and clinical information.`,
        },
      ],
    };
  },
  component: MedicineDetail,
});

function List({ items }: { items: string[] | null }) {
  if (!items || items.length === 0)
    return <p className="text-sm text-muted-foreground">Not recorded in the starter database.</p>;
  return (
    <ul className="list-disc space-y-1 pl-5 text-sm">
      {items.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  );
}

function Text({ value }: { value: string | null }) {
  return (
    <p className="text-sm leading-relaxed">
      {value || <span className="text-muted-foreground">Not recorded in the starter database.</span>}
    </p>
  );
}

function MedicineDetail() {
  const { slug } = useParams({ from: "/medicines/$slug" });
  const { data: m, isLoading } = useQuery(medicineQuery(slug));
  const { data: brands } = useQuery(medicineBrandsQuery(m?.id));
  const { data: classes } = useQuery(medicineClassesQuery(m?.id));
  const { data: refs } = useQuery(medicineReferencesQuery(m?.id));
  const { data: interactions } = useQuery(medicineInteractionsQuery(m?.id));
  const { toggle, isFavorite } = useFavorites();
  const track = useTrackView();

  useEffect(() => {
    if (m) void track("medicine", m.slug, m.display_name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m?.id]);

  if (isLoading) return <Skeleton className="h-96 rounded-xl" />;
  if (!m)
    return (
      <div className="surface p-8 text-center">
        <h1 className="font-display text-xl font-semibold">Medicine not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This medicine is not in the starter database yet.
        </p>
        <Button asChild className="mt-4">
          <Link to="/medicines">Back to medicines</Link>
        </Button>
      </div>
    );

  const aiContext = JSON.stringify({
    name: m.display_name,
    salt: m.salt,
    mechanism: m.mechanism_of_action,
    adme: {
      absorption: m.absorption,
      distribution: m.distribution,
      metabolism: m.metabolism,
      excretion: m.excretion,
    },
    indications: m.indications,
    warnings: m.warnings,
    adverse: m.common_adverse_effects,
  });

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/medicines">
          <ArrowLeft className="size-4" /> Medicines
        </Link>
      </Button>

      <header className="surface p-5">
        <h1 className="font-display text-2xl font-bold uppercase sm:text-3xl">{m.generic_name}</h1>
        {m.pronunciation_en && (
          <p className="mt-1 text-sm text-primary">
            {m.pronunciation_en}
            {m.pronunciation_hi ? ` • ${m.pronunciation_hi}` : ""}
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(classes ?? []).map((c) => (
            <Link key={c.id} to="/classes/$slug" params={{ slug: c.slug }}>
              <Badge variant="secondary">{c.name}</Badge>
            </Link>
          ))}
          {m.category && <Badge variant="outline">{m.category}</Badge>}
          <Badge className="gap-1 bg-success text-success-foreground">
            <ShieldCheck className="size-3" /> {m.verification_status}
          </Badge>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <PronounceButtons text={m.generic_name} />
          <ExplainButton topic={m.display_name} context={aiContext} />
          <Button asChild variant="outline" size="sm">
            <Link to="/memory">
              <Brain className="size-4" /> Remember
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/compare" search={{ a: m.slug }}>
              <Scale className="size-4" /> Compare
            </Link>
          </Button>
          <Button
            variant={isFavorite("medicine", m.slug) ? "default" : "outline"}
            size="sm"
            onClick={() =>
              toggle.mutate(
                { item_type: "medicine", item_id: m.slug, label: m.display_name },
                {
                  onSuccess: (r) => toast.success(r === "added" ? "Added to favourites" : "Removed"),
                  onError: (e) => toast.error(e.message),
                },
              )
            }
          >
            <Star className="size-4" /> Favourite
          </Button>
        </div>
      </header>

      <p className="text-sm leading-relaxed text-muted-foreground">{m.description}</p>

      <Accordion type="multiple" defaultValue={["overview", "moa"]} className="space-y-2">
        <Section value="overview" title="Overview">
          <dl className="grid gap-3 sm:grid-cols-2">
            <Field label="Generic" value={m.generic_name} />
            <Field label="Salt / Active ingredient" value={m.salt ?? m.active_ingredient} />
            <Field label="Strengths" value={(m.strengths ?? []).join(", ")} />
            <Field label="Dosage forms" value={(m.dosage_forms ?? []).join(", ")} />
            <Field label="Routes" value={(m.routes ?? []).join(", ")} />
            <Field label="Storage" value={m.storage} />
            <Field label="Onset" value={m.onset} />
            <Field label="Duration" value={m.duration} />
          </dl>
        </Section>

        <Section value="brands" title={`Brands & Manufacturers (${brands?.length ?? 0})`}>
          {(brands?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">No brand record yet.</p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {(brands ?? []).map((b) => (
                <li key={b.id}>
                  <Link
                    to="/brands/$id"
                    params={{ id: b.id }}
                    className="block rounded-lg border p-3 text-sm transition-colors hover:bg-accent"
                  >
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{b.brand_name}</span>
                      <VerificationBadge status={b.verification_status} />
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {b.composition ?? "Composition not yet verified"}
                      {b.strength ? ` • ${b.strength}` : ""}
                      {b.dosage_form ? ` • ${b.dosage_form}` : ""}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {b.manufacturers?.name ?? "Manufacturer not recorded"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            Brand records are factual reference data. They do not imply any brand or company is
            better, safer or recommended.
          </p>
        </Section>

        <Section value="moa" title="Mechanism of Action & Pharmacodynamics" term="Mechanism of Action">
          <Text value={m.mechanism_of_action} />
          <div className="mt-3">
            <Text value={m.pharmacodynamics} />
          </div>
          <div className="mt-3">
            <ExplainButton
              topic={`Mechanism of ${m.generic_name}`}
              context={m.mechanism_of_action ?? ""}
            />
          </div>
        </Section>

        <Section value="adme" title="ADME" term="ADME">
          <div className="grid gap-2 sm:grid-cols-2">
            <AdmeCard step="A" title="Absorption" value={m.absorption} />
            <AdmeCard step="D" title="Distribution" value={m.distribution} />
            <AdmeCard step="M" title="Metabolism" value={m.metabolism} />
            <AdmeCard step="E" title="Excretion" value={m.excretion} />
          </div>
        </Section>

        <Section value="pk" title="Pharmacokinetics" term="Pharmacokinetics">
          <dl className="grid gap-3 sm:grid-cols-2">
            <Field label="Bioavailability" value={m.bioavailability} />
            <Field label="Half-life" value={m.half_life} />
            <Field label="Protein binding" value={m.protein_binding} />
            <Field label="Volume of distribution" value={m.volume_of_distribution} />
            <Field label="Clearance" value={m.clearance} />
          </dl>
        </Section>

        <Section value="uses" title="Uses / Indications" term="Indications">
          <List items={m.indications} />
        </Section>
        <Section value="contra" title="Contraindications" term="Contraindications">
          <List items={m.contraindications} />
        </Section>
        <Section value="warn" title="Warnings & Precautions" term="Precautions">
          <List items={m.warnings} />
          <div className="mt-2">
            <List items={m.precautions} />
          </div>
        </Section>
        <Section value="ae" title="Adverse Effects" term="Adverse Effects">
          <p className="mb-1 text-xs font-medium text-muted-foreground">Common</p>
          <List items={m.common_adverse_effects} />
          <p className="mt-3 mb-1 text-xs font-medium text-muted-foreground">Serious</p>
          <List items={m.serious_adverse_effects} />
        </Section>
        <Section value="inter" title="Interactions" term="Interactions">
          <List items={m.drug_interactions} />
          {(interactions?.length ?? 0) > 0 && (
            <div className="mt-3 space-y-2">
              {(interactions ?? []).map((i) => (
                <div key={i.id} className="rounded-lg border p-3 text-sm">
                  <p className="font-medium">
                    {i.a?.display_name} + {i.b?.display_name}{" "}
                    <Badge variant="outline" className="ml-1 capitalize">
                      {i.severity}
                    </Badge>
                  </p>
                  <p className="mt-1 text-muted-foreground">{i.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{i.professional_consideration}</p>
                </div>
              ))}
            </div>
          )}
          <div className="mt-3">
            <List items={m.food_interactions} />
          </div>
        </Section>
        <Section value="pop" title="Special Populations">
          <dl className="grid gap-3 sm:grid-cols-2">
            <Field label="Pregnancy" value={m.pregnancy} />
            <Field label="Lactation" value={m.lactation} />
            <Field label="Pediatric" value={m.pediatric} />
            <Field label="Geriatric" value={m.geriatric} />
            <Field label="Renal" value={m.renal} />
            <Field label="Hepatic" value={m.hepatic} />
          </dl>
        </Section>
        <Section value="mon" title="Monitoring & Counselling" term="Monitoring">
          <List items={m.monitoring} />
          <div className="mt-3">
            <List items={m.patient_counselling} />
          </div>
        </Section>
        <Section value="edu" title="Learning Notes">
          <p className="mb-1 text-xs font-medium text-muted-foreground">Advantages</p>
          <List items={m.advantages} />
          <p className="mt-3 mb-1 text-xs font-medium text-muted-foreground">Disadvantages</p>
          <List items={m.disadvantages} />
          <p className="mt-3 mb-1 text-xs font-medium text-muted-foreground">Key points</p>
          <List items={m.key_points} />
          {m.memory_trick && (
            <div className="mt-3 rounded-lg bg-accent p-3 text-sm text-accent-foreground">
              <strong>Memory trick:</strong> {m.memory_trick}
              <p className="mt-1 text-xs">
                Mnemonic is a learning aid. Always verify the actual classification in the medicine
                record.
              </p>
            </div>
          )}
        </Section>
        <Section value="ref" title="References & Verification">
          <ul className="space-y-1 text-sm">
            {(refs ?? []).map((r) => (
              <li key={r.id}>
                {r.source_url ? (
                  <a
                    href={r.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline underline-offset-2"
                  >
                    {r.source_name}
                  </a>
                ) : (
                  r.source_name
                )}
                {r.source_type ? ` — ${r.source_type}` : ""}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Status: {m.verification_status} • Last verified: {m.last_verified ?? "—"} • Data version{" "}
            {m.data_version}
          </p>
        </Section>
      </Accordion>

      <Disclaimer />
    </div>
  );
}

function Section({
  value,
  title,
  term,
  children,
}: {
  value: string;
  title: string;
  term?: string;
  children: React.ReactNode;
}) {
  return (
    <AccordionItem value={value} className="surface border px-4">
      <AccordionTrigger className="text-left font-display font-semibold">
        <span className="flex items-center gap-1.5">
          {title}
          {term ? <MedicalTermHelp term={term} /> : null}
        </span>
      </AccordionTrigger>
      <AccordionContent className="pb-4">{children}</AccordionContent>
    </AccordionItem>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
        {label}
        <MedicalTermHelp term={label} />
      </dt>
      <dd className="text-sm">{value || "Not yet verified"}</dd>
    </div>
  );
}

function AdmeCard({ step, title, value }: { step: string; title: string; value: string | null }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center gap-2">
        <span className="grid size-6 place-items-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
          {step}
        </span>
        <p className="text-sm font-semibold">{title}</p>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{value || "Not recorded."}</p>
    </div>
  );
}
