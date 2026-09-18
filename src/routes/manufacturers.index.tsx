import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Factory } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VerificationBadge } from "@/components/verification-badge";
import { manufacturersQuery } from "@/lib/queries";

export const Route = createFileRoute("/manufacturers/")({
  head: () => ({
    meta: [
      { title: "Pharma Companies — Indian Manufacturer Directory | MediVault India" },
      {
        name: "description",
        content:
          "Browse Indian pharmaceutical companies and their recorded brands, with an explicit verification status for every entry.",
      },
      { property: "og:title", content: "Pharma Companies — MediVault India" },
      {
        property: "og:description",
        content: "Indian pharmaceutical manufacturers, their brands and verification status.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ManufacturerDirectory,
  errorComponent: ({ error }) => (
    <p role="alert" className="p-6 text-sm text-destructive">
      {error.message}
    </p>
  ),
  notFoundComponent: () => <p className="p-6 text-sm">No companies found.</p>,
});

const LETTERS = ["All", ...("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""))];

function ManufacturerDirectory() {
  const { data, isLoading } = useQuery(manufacturersQuery());
  const [q, setQ] = useState("");
  const [letter, setLetter] = useState("All");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (data ?? []).filter((m) => {
      if (verifiedOnly && m.verification_status !== "verified") return false;
      if (letter !== "All" && !m.name.toUpperCase().startsWith(letter)) return false;
      if (needle && !m.name.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [data, q, letter, verifiedOnly]);

  const recent = useMemo(
    () =>
      (data ?? [])
        .filter((m) => m.verification_status === "verified" && m.last_verified)
        .sort((a, b) => (b.last_verified ?? "").localeCompare(a.last_verified ?? ""))
        .slice(0, 6),
    [data],
  );

  return (
    <div className="space-y-5">
      <header>
        <Badge variant="secondary" className="mb-2">
          Company & brand directory
        </Badge>
        <h1 className="font-display text-2xl font-bold">Pharma Companies</h1>
        <p className="text-sm text-muted-foreground">
          {(data ?? []).length} companies on record. A company is shown as verified only when at
          least one of its brands has verified composition and a source. This directory is factual
          reference data — it does not recommend any company or brand.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search company name..."
          aria-label="Search pharmaceutical companies"
          className="max-w-xs"
        />
        <Button
          size="sm"
          variant={verifiedOnly ? "default" : "outline"}
          onClick={() => setVerifiedOnly((v) => !v)}
        >
          Verified companies
        </Button>
      </div>

      <div className="flex flex-wrap gap-1">
        {LETTERS.map((l) => (
          <Button
            key={l}
            size="sm"
            variant={letter === l ? "secondary" : "ghost"}
            className="h-7 px-2 text-xs"
            onClick={() => setLetter(l)}
          >
            {l}
          </Button>
        ))}
      </div>

      {recent.length > 0 && (
        <section className="surface space-y-2 p-4">
          <h2 className="font-display text-sm font-semibold">Recently verified</h2>
          <div className="flex flex-wrap gap-2">
            {recent.map((m) => (
              <Button key={m.id} asChild size="sm" variant="outline">
                <Link to="/manufacturers/$id" params={{ id: m.id }}>
                  {m.name}
                </Link>
              </Button>
            ))}
          </div>
        </section>
      )}

      <ul className="grid gap-2 sm:grid-cols-2">
        {rows.map((m) => (
          <li key={m.id}>
            <Link
              to="/manufacturers/$id"
              params={{ id: m.id }}
              className="surface press-feedback flex items-start gap-3 p-4 transition-shadow hover:shadow-[var(--shadow-float)]"
            >
              <Factory className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{m.name}</span>
                <span className="block text-xs text-muted-foreground">
                  {m.country ?? "Country not recorded"} • {m.verified_brand_count} verified brand
                  {m.verified_brand_count === 1 ? "" : "s"}
                </span>
              </span>
              <VerificationBadge status={m.verification_status} />
            </Link>
          </li>
        ))}
        {rows.length === 0 && !isLoading && (
          <li className="surface p-6 text-center text-sm text-muted-foreground sm:col-span-2">
            No company matches this filter.
          </li>
        )}
      </ul>
    </div>
  );
}
