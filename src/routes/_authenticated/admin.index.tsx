import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { saveManufacturer, setMedicineStatus } from "@/lib/admin.functions";
import { DATASET_LABEL } from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Admin — Medicine Editor | MediVault India" },
      {
        name: "description",
        content: "Admin-only editor for the MediVault India medicine reference database.",
      },
      { property: "og:title", content: "Admin — Medicine Editor" },
      { property: "og:description", content: "Manage medicines, brands and references." },
    ],
  }),
  component: AdminHome,
});

function AdminHome() {
  const { isAdmin, loading } = useAuth();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [mfr, setMfr] = useState("");
  const archive = useServerFn(setMedicineStatus);
  const addManufacturer = useServerFn(saveManufacturer);

  const meds = useQuery({
    queryKey: ["admin-medicines"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("medicines")
        .select("id, slug, display_name, generic_name, category, status, verification_status, last_verified")
        .order("generic_name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const logs = useQuery({
    queryKey: ["admin-audit"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_audit_logs")
        .select("id, action, table_name, record_id, created_at")
        .order("created_at", { ascending: false })
        .limit(15);
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return meds.data ?? [];
    return (meds.data ?? []).filter((m) =>
      `${m.display_name} ${m.generic_name} ${m.category ?? ""}`.toLowerCase().includes(t),
    );
  }, [meds.data, q]);

  if (loading) return <p className="text-sm text-muted-foreground">Checking permissions…</p>;

  if (!isAdmin)
    return (
      <div className="surface mx-auto max-w-md p-8 text-center">
        <h1 className="font-display text-xl font-semibold">Admin access required</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This area is limited to verified administrators. All database rules are enforced on the
          server, so nothing can be edited from here without the admin role.
        </p>
      </div>
    );

  async function setStatus(id: string, status: "published" | "archived") {
    try {
      await archive({ data: { id, status } });
      toast.success(status === "archived" ? "Medicine archived" : "Medicine published");
      await qc.invalidateQueries({ queryKey: ["admin-medicines"] });
      await qc.invalidateQueries({ queryKey: ["admin-audit"] });
    } catch {
      toast.error("Could not update the status.");
    }
  }

  async function createManufacturer() {
    if (mfr.trim().length < 2) return;
    try {
      await addManufacturer({ data: { name: mfr.trim(), status: "active" } });
      setMfr("");
      toast.success("Manufacturer added");
    } catch {
      toast.error("Could not save this manufacturer.");
    }
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center gap-3">
        <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
          <ShieldCheck className="size-5" />
        </span>
        <div className="mr-auto">
          <h1 className="font-display text-2xl font-bold">Medicine Editor</h1>
          <p className="text-xs text-muted-foreground">{DATASET_LABEL}</p>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link to="/admin/manufacturers">Manufacturers</Link>
        </Button>
        <Button asChild size="sm">
          <Link to="/admin/$id" params={{ id: "new" }}>
            <Plus className="size-4" /> Add medicine
          </Link>
        </Button>
      </header>

      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Filter medicines…"
        aria-label="Filter medicines"
      />

      <ul className="grid gap-2">
        {filtered.map((m) => (
          <li key={m.id} className="surface flex flex-wrap items-center gap-2 p-3">
            <div className="mr-auto min-w-0">
              <p className="truncate font-medium">{m.display_name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {m.generic_name} • {m.category ?? "Uncategorised"} • last verified{" "}
                {m.last_verified ?? "Not yet verified"}
              </p>
            </div>
            <Badge variant={m.status === "published" ? "secondary" : "outline"}>{m.status}</Badge>
            <Badge variant={m.verification_status === "verified" ? "default" : "outline"}>
              {m.verification_status === "verified" ? "Verified" : "Not yet verified"}
            </Badge>
            <Button asChild size="sm" variant="outline">
              <Link to="/admin/$id" params={{ id: m.id }}>
                Edit
              </Link>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => void setStatus(m.id, m.status === "archived" ? "published" : "archived")}
            >
              {m.status === "archived" ? "Restore" : "Archive"}
            </Button>
          </li>
        ))}
        {filtered.length === 0 && !meds.isLoading && (
          <li className="surface p-6 text-center text-sm text-muted-foreground">
            No medicines match this filter.
          </li>
        )}
      </ul>

      <section className="surface space-y-3 p-4">
        <h2 className="font-display font-semibold">Manufacturers</h2>
        <div className="flex gap-2">
          <Input
            value={mfr}
            onChange={(e) => setMfr(e.target.value)}
            placeholder="New manufacturer name"
            aria-label="New manufacturer name"
          />
          <Button onClick={() => void createManufacturer()}>Add</Button>
        </div>
      </section>

      <section className="surface space-y-2 p-4">
        <h2 className="font-display font-semibold">Recent admin activity</h2>
        <ul className="space-y-1 text-xs text-muted-foreground">
          {(logs.data ?? []).map((l) => (
            <li key={l.id}>
              {new Date(l.created_at).toLocaleString()} — {l.action} ({l.table_name})
            </li>
          ))}
          {(logs.data ?? []).length === 0 && <li>No admin changes recorded yet.</li>}
        </ul>
      </section>
    </div>
  );
}
