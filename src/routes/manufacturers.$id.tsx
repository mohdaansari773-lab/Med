import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { VerificationBadge } from "@/components/verification-badge";
import {
  manufacturerBrandsQuery,
  manufacturerClassesQuery,
  manufacturerQuery,
} from "@/lib/queries";


export const Route = createFileRoute("/manufacturers/$id")({
  head: () => ({
    meta: [
      { title: "Company Profile — Brands & Medicines | MediVault India" },
      {
        name: "description",
        content:
          "Pharmaceutical company profile: recorded brands, the generic medicines they map to and the verification status of each record.",
      },
      { property: "og:title", content: "Company Profile — MediVault India" },
      {
        property: "og:description",
        content: "Recorded brands, generic medicines and verification status for this company.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ManufacturerProfile,
  errorComponent: ({ error }) => (
    <p role="alert" className="p-6 text-sm text-destructive">
      {error.message}
    </p>
  ),
  notFoundComponent: () => <p className="p-6 text-sm">Company not found.</p>,
});

function ManufacturerProfile() {
  const { id } = Route.useParams();
  const { data: m, isLoading } = useQuery(manufacturerQuery(id));
  const { data: brands } = useQuery(manufacturerBrandsQuery(id));

  const list = brands ?? [];
  const medicineIds = Array.from(
    new Set(list.flatMap((b) => (b.medicines?.id ? [b.medicines.id] : []))),
  );
  const { data: classes } = useQuery(manufacturerClassesQuery(medicineIds));

  if (isLoading) return <p className="p-6 text-sm text-muted-foreground">Loading company...</p>;
  if (!m) return <p className="p-6 text-sm">Company not found.</p>;

  const verified = list.filter((b) => b.verification_status === "verified");
  const pending = list.filter((b) => b.verification_status !== "verified");
  const forms = Array.from(
    new Set(verified.map((b) => b.dosage_form).filter((f): f is string => !!f)),
  );
  const medicines = Array.from(
    new Map(
      verified.flatMap((b) => (b.medicines ? [[b.medicines.slug, b.medicines] as const] : [])),
    ).values(),
  ).sort((a, b) => a.display_name.localeCompare(b.display_name));
  const sources = Array.from(
    new Set(
      list.flatMap((b) =>
        b.references?.source_name ? [b.references.source_name] : b.source ? [b.source] : [],
      ),
    ),
  );


  return (
    <div className="space-y-5">
      <header className="space-y-2">
        <Link to="/manufacturers" className="text-xs text-muted-foreground hover:text-primary">
          ← Pharma Companies
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-2xl font-bold">{m.name}</h1>
          <VerificationBadge status={m.verification_status} />
        </div>
        <p className="text-sm text-muted-foreground">
          {m.country ?? "Country not recorded"} • {verified.length} verified brand
          {verified.length === 1 ? "" : "s"}
          {m.last_verified ? ` • last verified ${m.last_verified}` : ""}
        </p>
        {m.website && (
          <a
            href={m.website}
            target="_blank"
            rel="noreferrer noopener"
            className="text-xs underline underline-offset-2"
          >
            {m.website}
          </a>
        )}
      </header>

      {forms.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {forms.map((f) => (
            <Badge key={f} variant="secondary">
              {f}
            </Badge>
          ))}
        </div>
      )}

      <section className="space-y-2">
        <h2 className="font-display font-semibold">Verified brands ({verified.length})</h2>
        {verified.length === 0 ? (
          <p className="surface p-4 text-sm text-muted-foreground">
            No verified brand recorded for this company yet. Brand, composition and manufacturer
            data must be confirmed against a reliable source before it appears here.
          </p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {verified.map((b) => (
              <li key={b.id}>
                <Link
                  to="/brands/$id"
                  params={{ id: b.id }}
                  className="surface press-feedback block p-4 transition-shadow hover:shadow-[var(--shadow-float)]"
                >
                  <span className="block font-medium">{b.brand_name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {b.medicines?.display_name ?? "Generic not linked"}
                    {b.strength ? ` • ${b.strength}` : ""}
                    {b.dosage_form ? ` • ${b.dosage_form}` : ""}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {pending.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-display font-semibold">Needs verification ({pending.length})</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {pending.map((b) => (
              <li key={b.id} className="surface p-4 text-sm">
                <p className="font-medium">{b.brand_name}</p>
                <p className="text-xs text-muted-foreground">
                  {b.medicines?.display_name ?? "Generic not linked"} • Not yet verified
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {medicines.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-display font-semibold">
            Associated generic medicines ({medicines.length})
          </h2>
          <ul className="flex flex-wrap gap-1.5">
            {medicines.map((med) => (
              <li key={med.slug}>
                <Link
                  to="/medicines/$slug"
                  params={{ slug: med.slug }}
                  className="inline-block rounded-md border px-2.5 py-1 text-xs hover:border-primary"
                >
                  {med.display_name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(classes ?? []).length > 0 && (
        <section className="space-y-2">
          <h2 className="font-display font-semibold">Drug classes represented</h2>
          <ul className="flex flex-wrap gap-1.5">
            {(classes ?? []).map((c) => (
              <li key={c.id}>
                <Link
                  to="/classes/$slug"
                  params={{ slug: c.slug }}
                  className="inline-block rounded-md border px-2.5 py-1 text-xs hover:border-primary"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="surface space-y-1 p-4 text-xs text-muted-foreground">
        <h2 className="font-display text-sm font-semibold text-foreground">References</h2>
        <p>{m.source ?? "No source recorded for this company yet."}</p>
        {sources.map((s) => (
          <p key={s}>{s}</p>
        ))}
        <p>
          Company and brand records are factual reference data only. They do not imply that any
          company or brand is better, safer or recommended.
        </p>
      </section>

    </div>
  );
}
