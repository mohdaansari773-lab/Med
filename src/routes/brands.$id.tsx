import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VerificationBadge } from "@/components/verification-badge";
import { brandQuery, medicineClassesQuery } from "@/lib/queries";

export const Route = createFileRoute("/brands/$id")({
  head: () => ({
    meta: [
      { title: "Brand Record — Manufacturer & Generic | MediVault India" },
      {
        name: "description",
        content:
          "Brand record showing the manufacturer, generic medicine, composition, strength, dosage form and verification status.",
      },
      { property: "og:title", content: "Brand Record — MediVault India" },
      {
        property: "og:description",
        content: "Manufacturer, generic medicine, composition and verification status.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BrandPage,
  errorComponent: ({ error }) => (
    <p role="alert" className="p-6 text-sm text-destructive">
      {error.message}
    </p>
  ),
  notFoundComponent: () => <p className="p-6 text-sm">Brand not found.</p>,
});

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="grid gap-0.5 border-b py-2 last:border-0 sm:grid-cols-[200px_1fr]">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value || "Not yet verified"}</dd>
    </div>
  );
}

function BrandPage() {
  const { id } = Route.useParams();
  const { data: b, isLoading } = useQuery(brandQuery(id));
  const { data: classes } = useQuery(medicineClassesQuery(b?.medicines?.id));

  if (isLoading) return <p className="p-6 text-sm text-muted-foreground">Loading brand...</p>;
  if (!b) return <p className="p-6 text-sm">Brand not found.</p>;

  const therapeutic = (classes ?? []).filter((c) => c.class_type === "therapeutic");
  const pharmacological = (classes ?? []).filter((c) => c.class_type !== "therapeutic");

  return (
    <div className="space-y-5">
      <header className="space-y-2">
        <Link to="/manufacturers" className="text-xs text-muted-foreground hover:text-primary">
          ← Pharma Companies
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-2xl font-bold">{b.brand_name}</h1>
          <VerificationBadge status={b.verification_status} />
        </div>
        <p className="text-sm text-muted-foreground">
          Brand record. This is not a separate generic medicine — it maps to the generic below.
        </p>
      </header>

      <dl className="surface p-4">
        <Row
          label="Manufacturer"
          value={b.manufacturers?.name ?? "Manufacturer not yet verified"}
        />
        <Row label="Generic medicine" value={b.medicines?.display_name} />
        <Row
          label="Active ingredient"
          value={b.active_ingredient ?? b.medicines?.active_ingredient}
        />
        <Row label="Salt / composition" value={b.composition ?? b.medicines?.salt} />
        <Row label="Strength" value={b.strength} />
        <Row label="Dosage form" value={b.dosage_form} />
        <Row label="Route" value={b.route} />
        <Row
          label="Therapeutic classification"
          value={therapeutic.map((c) => c.name).join(", ")}
        />
        <Row
          label="Pharmacological classification"
          value={pharmacological.map((c) => c.name).join(", ")}
        />
        <Row
          label="Source / reference"
          value={b.references?.source_name ?? b.source}
        />
        <Row label="Last verified" value={b.last_verified} />
      </dl>

      <div className="flex flex-wrap gap-2">
        {b.medicines && (
          <Button asChild>
            <Link to="/medicines/$slug" params={{ slug: b.medicines.slug }}>
              View generic medicine
            </Link>
          </Button>
        )}
        {b.manufacturers && (
          <Button asChild variant="outline">
            <Link to="/manufacturers/$id" params={{ id: b.manufacturers.id }}>
              View manufacturer
            </Link>
          </Button>
        )}
      </div>

      {b.verification_status !== "verified" && (
        <p className="surface p-4 text-xs text-muted-foreground">
          <Badge variant="outline" className="mr-2">
            Needs verification
          </Badge>
          Parts of this record are not yet confirmed against a reliable source, so it is not shown
          as verified. Nothing here implies this brand is better, safer or recommended.
        </p>
      )}
    </div>
  );
}
