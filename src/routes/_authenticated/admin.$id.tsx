import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
  saveMedicine,
  saveBrand,
  deleteBrand,
  setBrandStatus,
  saveReference,
  unlinkReference,
  setMedicineClasses,
  type MedicineFormValues,
} from "@/lib/admin.functions";
import { manufacturersQuery } from "@/lib/queries";

const EMPTY_BRAND = {
  brand_name: "",
  composition: "",
  strength: "",
  dosage_form: "",
  route: "",
  source: "",
  manufacturer_id: "",
  verification_status: "under_review",
};

export const Route = createFileRoute("/_authenticated/admin/$id")({
  head: () => ({
    meta: [
      { title: "Edit medicine — Admin | MediVault India" },
      { name: "description", content: "Admin-only medicine record editor." },
      { property: "og:title", content: "Edit medicine — Admin" },
      { property: "og:description", content: "Admin-only medicine record editor." },
    ],
  }),
  component: AdminEditor,
});

type Form = Record<string, unknown>;

const TEXT_FIELDS: [keyof MedicineFormValues & string, string][] = [
  ["slug", "Slug"],
  ["generic_name", "Generic name"],
  ["display_name", "Display name"],
  ["active_ingredient", "Active ingredient"],
  ["salt", "Salt"],
  ["category", "Category"],
  ["key_suffix", "Key suffix"],
  ["pronunciation_en", "Pronunciation (English)"],
  ["pronunciation_hi", "Pronunciation (Hindi)"],
  ["pronunciation_ipa", "Pronunciation (IPA)"],
  ["bioavailability", "Bioavailability"],
  ["half_life", "Half life"],
  ["protein_binding", "Protein binding"],
  ["volume_of_distribution", "Volume of distribution"],
  ["clearance", "Clearance"],
  ["onset", "Onset"],
  ["duration", "Duration"],
];

const LONG_FIELDS: [string, string][] = [
  ["description", "Description"],
  ["mechanism_of_action", "Mechanism of action"],
  ["pharmacodynamics", "Pharmacodynamics"],
  ["absorption", "ADME — Absorption"],
  ["distribution", "ADME — Distribution"],
  ["metabolism", "ADME — Metabolism"],
  ["excretion", "ADME — Excretion"],
  ["storage", "Storage"],
  ["pregnancy", "Pregnancy"],
  ["lactation", "Lactation"],
  ["pediatric", "Paediatric"],
  ["geriatric", "Geriatric"],
  ["renal", "Renal"],
  ["hepatic", "Hepatic"],
  ["memory_trick", "Memory trick / Hindi–Hinglish explanation"],
];

const LIST_FIELDS: [string, string][] = [
  ["synonyms", "Synonyms"],
  ["strengths", "Strengths"],
  ["dosage_forms", "Dosage forms"],
  ["routes", "Routes"],
  ["indications", "Uses / indications"],
  ["contraindications", "Contraindications"],
  ["warnings", "Warnings"],
  ["precautions", "Precautions"],
  ["common_adverse_effects", "Common adverse effects"],
  ["serious_adverse_effects", "Serious adverse effects"],
  ["drug_interactions", "Drug interactions"],
  ["food_interactions", "Food interactions"],
  ["monitoring", "Monitoring"],
  ["patient_counselling", "Patient counselling"],
  ["advantages", "Advantages"],
  ["disadvantages", "Disadvantages"],
  ["key_points", "Key points"],
];

const EMPTY: Form = {
  slug: "",
  generic_name: "",
  display_name: "",
  status: "draft",
  verification_status: "unverified",
  data_version: "1.0",
};

function AdminEditor() {
  const { id } = Route.useParams();
  const isNew = id === "new";
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState<Form>(EMPTY);
  const [saving, setSaving] = useState(false);

  const save = useServerFn(saveMedicine);
  const brandSave = useServerFn(saveBrand);
  const brandDelete = useServerFn(deleteBrand);
  const brandStatus = useServerFn(setBrandStatus);
  const refSave = useServerFn(saveReference);
  const refUnlink = useServerFn(unlinkReference);
  const classSave = useServerFn(setMedicineClasses);

  const record = useQuery({
    queryKey: ["admin-medicine", id],
    enabled: isAdmin && !isNew,
    queryFn: async () => {
      const { data, error } = await supabase.from("medicines").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const classes = useQuery({
    queryKey: ["admin-classes"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data } = await supabase.from("drug_classes").select("id, name, class_type").order("name");
      return data ?? [];
    },
  });

  const linkedClasses = useQuery({
    queryKey: ["admin-medicine-classes", id],
    enabled: isAdmin && !isNew,
    queryFn: async () => {
      const { data } = await supabase
        .from("medicine_classifications")
        .select("class_id, is_primary")
        .eq("medicine_id", id);
      return data ?? [];
    },
  });

  const brands = useQuery({
    queryKey: ["admin-brands", id],
    enabled: isAdmin && !isNew,
    queryFn: async () => {
      const { data } = await supabase.from("brands").select("*").eq("medicine_id", id).order("brand_name");
      return data ?? [];
    },
  });

  const refs = useQuery({
    queryKey: ["admin-refs", id],
    enabled: isAdmin && !isNew,
    queryFn: async () => {
      const { data } = await supabase
        .from("medicine_references")
        .select("reference_id, references(id, source_name, source_url)")
        .eq("medicine_id", id);
      return data ?? [];
    },
  });

  const [selected, setSelected] = useState<string[]>([]);
  const [brandDraft, setBrandDraft] = useState(EMPTY_BRAND);
  const makers = useQuery(manufacturersQuery());
  const [refDraft, setRefDraft] = useState({ source_name: "", source_url: "" });

  useEffect(() => {
    if (record.data) setForm(record.data as unknown as Form);
  }, [record.data]);

  useEffect(() => {
    if (linkedClasses.data) setSelected(linkedClasses.data.map((c) => c.class_id));
  }, [linkedClasses.data]);

  if (loading) return <p className="text-sm text-muted-foreground">Checking permissions…</p>;
  if (!isAdmin)
    return (
      <div className="surface mx-auto max-w-md p-8 text-center">
        <h1 className="font-display text-xl font-semibold">Admin access required</h1>
      </div>
    );

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  const str = (k: string) => (form[k] == null ? "" : String(form[k]));
  const arr = (k: string) => (Array.isArray(form[k]) ? (form[k] as string[]).join("\n") : "");

  async function onSave() {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { ...form };
      if (!isNew) payload["id"] = id;
      for (const [k] of LIST_FIELDS) {
        const v = payload[k];
        if (typeof v === "string")
          payload[k] = v.split("\n").map((s) => s.trim()).filter(Boolean);
      }
      delete payload["created_at"];
      delete payload["updated_at"];
      const res = await save({ data: payload as never });
      if (!isNew)
        await classSave({
          data: {
            medicine_id: id,
            classes: selected.map((c, i) => ({ class_id: c, is_primary: i === 0 })),
          },
        });
      toast.success("Medicine saved");
      await qc.invalidateQueries();
      if (isNew) void navigate({ to: "/admin/$id", params: { id: res.id } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save this medicine.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5 pb-16">
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="mr-auto font-display text-2xl font-bold">
          {isNew ? "Add medicine" : `Edit ${str("display_name") || "medicine"}`}
        </h1>
        <Button variant="outline" onClick={() => void navigate({ to: "/admin" })}>
          Back
        </Button>
        <Button disabled={saving} onClick={() => void onSave()}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </header>

      <p className="surface p-3 text-xs text-muted-foreground">
        Leave a field blank when the information cannot be verified from a reliable reference — the
        app then shows “Not yet verified” rather than presenting unverified content.
      </p>

      <section className="surface grid gap-3 p-4 sm:grid-cols-2">
        {TEXT_FIELDS.map(([k, label]) => (
          <div key={k} className="space-y-1">
            <Label htmlFor={k}>{label}</Label>
            <Input id={k} value={str(k)} onChange={(e) => set(k, e.target.value)} />
          </div>
        ))}
        <div className="space-y-1">
          <Label htmlFor="status">Status (published / draft / archived)</Label>
          <Input id="status" value={str("status")} onChange={(e) => set("status", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="verification_status">
            Verification status (verified / unverified / needs_review)
          </Label>
          <Input
            id="verification_status"
            value={str("verification_status")}
            onChange={(e) => set("verification_status", e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="last_verified">Last verified (YYYY-MM-DD)</Label>
          <Input
            id="last_verified"
            value={str("last_verified")}
            onChange={(e) => set("last_verified", e.target.value || null)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="data_version">Data version</Label>
          <Input
            id="data_version"
            value={str("data_version")}
            onChange={(e) => set("data_version", e.target.value)}
          />
        </div>
      </section>

      <section className="surface grid gap-3 p-4">
        {LONG_FIELDS.map(([k, label]) => (
          <div key={k} className="space-y-1">
            <Label htmlFor={k}>{label}</Label>
            <Textarea id={k} rows={3} value={str(k)} onChange={(e) => set(k, e.target.value)} />
          </div>
        ))}
      </section>

      <section className="surface grid gap-3 p-4">
        <h2 className="font-display font-semibold">Lists (one item per line)</h2>
        {LIST_FIELDS.map(([k, label]) => (
          <div key={k} className="space-y-1">
            <Label htmlFor={k}>{label}</Label>
            <Textarea
              id={k}
              rows={3}
              value={typeof form[k] === "string" ? (form[k] as string) : arr(k)}
              onChange={(e) => set(k, e.target.value)}
            />
          </div>
        ))}
      </section>

      {!isNew && (
        <>
          <section className="surface space-y-2 p-4">
            <h2 className="font-display font-semibold">Classification</h2>
            <div className="grid gap-1 sm:grid-cols-2">
              {(classes.data ?? []).map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={selected.includes(c.id)}
                    onCheckedChange={(v) =>
                      setSelected((s) => (v ? [...s, c.id] : s.filter((x) => x !== c.id)))
                    }
                  />
                  {c.name} <span className="text-xs text-muted-foreground">({c.class_type})</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              The first selected class is stored as the primary classification. Saved with the
              medicine.
            </p>
          </section>

          <section className="surface space-y-3 p-4">
            <h2 className="font-display font-semibold">Brands & manufacturers</h2>
            <ul className="space-y-1 text-sm">
              {(brands.data ?? []).map((b) => (
                <li key={b.id} className="flex flex-wrap items-center gap-2">
                  <span className="mr-auto">
                    {b.brand_name} — {b.composition ?? "Not yet verified"}
                    {b.strength ? ` • ${b.strength}` : ""} •{" "}
                    {b.verification_status === "verified" ? "Verified" : "Not yet verified"}
                  </span>
                  {(["verified", "under_review", "archived"] as const).map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={b.verification_status === s ? "secondary" : "ghost"}
                      onClick={async () => {
                        try {
                          await brandStatus({ data: { id: b.id, verification_status: s } });
                          await qc.invalidateQueries({ queryKey: ["admin-brands", id] });
                          toast.success("Brand status updated");
                        } catch (e) {
                          toast.error(
                            e instanceof Error ? e.message : "Could not update this brand.",
                          );
                        }
                      }}
                    >
                      {s === "verified" ? "Verify" : s === "archived" ? "Archive" : "Review"}
                    </Button>
                  ))}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      try {
                        await brandDelete({ data: { id: b.id } });
                        await qc.invalidateQueries({ queryKey: ["admin-brands", id] });
                      } catch {
                        toast.error("Could not remove this brand.");
                      }
                    }}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
            <div className="grid gap-2 sm:grid-cols-3">
              <Input
                placeholder="Brand name"
                aria-label="Brand name"
                value={brandDraft.brand_name}
                onChange={(e) => setBrandDraft({ ...brandDraft, brand_name: e.target.value })}
              />
              <Input
                placeholder="Verified composition"
                aria-label="Composition"
                value={brandDraft.composition}
                onChange={(e) => setBrandDraft({ ...brandDraft, composition: e.target.value })}
              />
              <Input
                placeholder="Strength"
                aria-label="Strength"
                value={brandDraft.strength}
                onChange={(e) => setBrandDraft({ ...brandDraft, strength: e.target.value })}
              />
              <Input
                placeholder="Dosage form"
                aria-label="Dosage form"
                value={brandDraft.dosage_form}
                onChange={(e) => setBrandDraft({ ...brandDraft, dosage_form: e.target.value })}
              />
              <Input
                placeholder="Route"
                aria-label="Route"
                value={brandDraft.route}
                onChange={(e) => setBrandDraft({ ...brandDraft, route: e.target.value })}
              />
              <Input
                placeholder="Source / reference"
                aria-label="Source or reference"
                value={brandDraft.source}
                onChange={(e) => setBrandDraft({ ...brandDraft, source: e.target.value })}
              />
              <select
                aria-label="Manufacturer"
                className="h-9 rounded-md border bg-background px-2 text-sm"
                value={brandDraft.manufacturer_id}
                onChange={(e) => setBrandDraft({ ...brandDraft, manufacturer_id: e.target.value })}
              >
                <option value="">Manufacturer not recorded</option>
                {(makers.data ?? []).map((mk) => (
                  <option key={mk.id} value={mk.id}>
                    {mk.name}
                  </option>
                ))}
              </select>
              <select
                aria-label="Verification status"
                className="h-9 rounded-md border bg-background px-2 text-sm"
                value={brandDraft.verification_status}
                onChange={(e) =>
                  setBrandDraft({ ...brandDraft, verification_status: e.target.value })
                }
              >
                <option value="draft">Draft</option>
                <option value="under_review">Under review</option>
                <option value="verified">Verified</option>
                <option value="needs_update">Needs update</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <Button
              size="sm"
              onClick={async () => {
                try {
                  const res = await brandSave({
                    data: {
                      medicine_id: id,
                      brand_name: brandDraft.brand_name,
                      manufacturer_id: brandDraft.manufacturer_id || null,
                      composition: brandDraft.composition || null,
                      strength: brandDraft.strength || null,
                      dosage_form: brandDraft.dosage_form || null,
                      route: brandDraft.route || null,
                      source: brandDraft.source || null,
                      verification_status: brandDraft.verification_status as "under_review",
                    },
                  });
                  setBrandDraft(EMPTY_BRAND);
                  await qc.invalidateQueries({ queryKey: ["admin-brands", id] });
                  toast.success(
                    res.verification_status === "verified"
                      ? "Brand saved as verified"
                      : "Brand saved as Not yet verified",
                  );
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Could not save this brand.");
                }
              }}
            >
              Add brand
            </Button>
            <p className="text-xs text-muted-foreground">
              A brand can only be stored as verified when manufacturer, composition, dosage form and
              a source are all recorded. Anything else stays “Not yet verified”.
            </p>
          </section>

          <section className="surface space-y-3 p-4">
            <h2 className="font-display font-semibold">References</h2>
            <ul className="space-y-1 text-sm">
              {(refs.data ?? []).map((r) => (
                <li key={r.reference_id} className="flex items-center gap-2">
                  <span className="mr-auto">{r.references?.source_name}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      try {
                        await refUnlink({ data: { medicine_id: id, reference_id: r.reference_id } });
                        await qc.invalidateQueries({ queryKey: ["admin-refs", id] });
                      } catch {
                        toast.error("Could not remove this reference.");
                      }
                    }}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                placeholder="Source name"
                aria-label="Source name"
                value={refDraft.source_name}
                onChange={(e) => setRefDraft({ ...refDraft, source_name: e.target.value })}
              />
              <Input
                placeholder="Source URL (optional)"
                aria-label="Source URL"
                value={refDraft.source_url}
                onChange={(e) => setRefDraft({ ...refDraft, source_url: e.target.value })}
              />
            </div>
            <Button
              size="sm"
              onClick={async () => {
                try {
                  await refSave({
                    data: {
                      medicine_id: id,
                      source_name: refDraft.source_name,
                      source_url: refDraft.source_url || null,
                    },
                  });
                  setRefDraft({ source_name: "", source_url: "" });
                  await qc.invalidateQueries({ queryKey: ["admin-refs", id] });
                  toast.success("Reference added");
                } catch {
                  toast.error("Could not save this reference.");
                }
              }}
            >
              Add reference
            </Button>
          </section>
        </>
      )}
    </div>
  );
}
