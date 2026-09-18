import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VerificationBadge } from "@/components/verification-badge";
import { useAuth } from "@/hooks/use-auth";
import { manufacturersQuery } from "@/lib/queries";
import { saveManufacturer, setManufacturerStatus } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/manufacturers")({
  head: () => ({
    meta: [
      { title: "Manufacturers — Admin | MediVault India" },
      { name: "description", content: "Admin-only pharmaceutical company records." },
      { property: "og:title", content: "Manufacturers — Admin" },
      { property: "og:description", content: "Admin-only pharmaceutical company records." },
    ],
  }),
  component: AdminManufacturers,
});

const EMPTY = { name: "", country: "India", website: "", source: "" };

function AdminManufacturers() {
  const { isAdmin, loading } = useAuth();
  const qc = useQueryClient();
  const makers = useQuery(manufacturersQuery());
  const save = useServerFn(saveManufacturer);
  const setStatus = useServerFn(setManufacturerStatus);
  const [draft, setDraft] = useState(EMPTY);

  if (loading) return <p className="text-sm text-muted-foreground">Checking permissions…</p>;
  if (!isAdmin) return <p className="text-sm">Admins only.</p>;

  const refresh = () => qc.invalidateQueries({ queryKey: ["manufacturers"] });

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <Link to="/admin" className="text-xs text-muted-foreground hover:text-primary">
          ← Admin
        </Link>
        <h1 className="font-display text-2xl font-bold">Pharmaceutical companies</h1>
        <p className="text-sm text-muted-foreground">
          Company records are factual. A company only reads as verified when it has at least one
          verified brand and a recorded source.
        </p>
      </header>

      <section className="surface space-y-3 p-4">
        <h2 className="font-display font-semibold">Add company</h2>
        <div className="grid gap-2 sm:grid-cols-4">
          <Input
            placeholder="Company name"
            aria-label="Company name"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
          <Input
            placeholder="Country"
            aria-label="Country"
            value={draft.country}
            onChange={(e) => setDraft({ ...draft, country: e.target.value })}
          />
          <Input
            placeholder="Website"
            aria-label="Website"
            value={draft.website}
            onChange={(e) => setDraft({ ...draft, website: e.target.value })}
          />
          <Input
            placeholder="Source"
            aria-label="Source"
            value={draft.source}
            onChange={(e) => setDraft({ ...draft, source: e.target.value })}
          />
        </div>
        <Button
          size="sm"
          onClick={async () => {
            try {
              await save({
                data: {
                  name: draft.name,
                  country: draft.country || null,
                  website: draft.website || null,
                  source: draft.source || null,
                  status: "active",
                  verification_status: "under_review",
                },
              });
              setDraft(EMPTY);
              await refresh();
              toast.success("Company saved as Not yet verified");
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Could not save this company.");
            }
          }}
        >
          Add company
        </Button>
      </section>

      <section className="space-y-2">
        <h2 className="font-display font-semibold">
          All companies ({makers.data?.length ?? 0})
        </h2>
        <ul className="space-y-2">
          {(makers.data ?? []).map((m) => (
            <li key={m.id} className="surface flex flex-wrap items-center gap-2 p-3 text-sm">
              <Link
                to="/manufacturers/$id"
                params={{ id: m.id }}
                className="mr-auto font-medium hover:text-primary"
              >
                {m.name}
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  {m.verified_brand_count} verified brand
                  {m.verified_brand_count === 1 ? "" : "s"}
                </span>
              </Link>
              <VerificationBadge status={m.verification_status} />
              {(["verified", "under_review", "archived"] as const).map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={m.verification_status === s ? "secondary" : "ghost"}
                  onClick={async () => {
                    try {
                      await setStatus({ data: { id: m.id, verification_status: s } });
                      await refresh();
                      toast.success("Company status updated");
                    } catch (e) {
                      toast.error(
                        e instanceof Error ? e.message : "Could not update this company.",
                      );
                    }
                  }}
                >
                  {s === "verified" ? "Verify" : s === "archived" ? "Archive" : "Review"}
                </Button>
              ))}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
