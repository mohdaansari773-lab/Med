import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Upload, AlertTriangle, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { importMedicines } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/import")({
  head: () => ({
    meta: [
      { title: "Admin — Import Medicines | MediVault India" },
      {
        name: "description",
        content: "Preview, validate and import medicine records from CSV or JSON.",
      },
      { property: "og:title", content: "Admin — Import Medicines" },
      { property: "og:description", content: "CSV/JSON import with validation and preview." },
    ],
  }),
  component: ImportPage,
});

const REQUIRED = ["slug", "generic_name", "display_name"] as const;
const LIST_FIELDS = new Set([
  "indications",
  "contraindications",
  "common_adverse_effects",
  "dosage_forms",
  "routes",
  "strengths",
]);
const ALLOWED = new Set([
  "slug",
  "generic_name",
  "display_name",
  "active_ingredient",
  "salt",
  "category",
  "description",
  "mechanism_of_action",
  "pronunciation_en",
  ...LIST_FIELDS,
]);

type ParsedRow = Record<string, unknown>;
type Parsed = { rows: ParsedRow[]; errors: string[]; warnings: string[] };

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out.map((v) => v.trim());
}

function normalise(raw: ParsedRow): ParsedRow {
  const row: ParsedRow = {};
  for (const [k, v] of Object.entries(raw)) {
    const key = k.trim().toLowerCase().replace(/\s+/g, "_");
    if (!ALLOWED.has(key)) continue;
    if (v == null || v === "") continue;
    if (LIST_FIELDS.has(key)) {
      row[key] = Array.isArray(v)
        ? v.map(String)
        : String(v)
            .split(/[;|]/)
            .map((s) => s.trim())
            .filter(Boolean);
    } else {
      row[key] = typeof v === "string" ? v.trim() : v;
    }
  }
  return row;
}

function parseInput(input: string): Parsed {
  const errors: string[] = [];
  const warnings: string[] = [];
  const text = input.trim();
  if (!text) return { rows: [], errors, warnings };

  let raw: ParsedRow[] = [];
  if (text.startsWith("[") || text.startsWith("{")) {
    try {
      const json: unknown = JSON.parse(text);
      raw = Array.isArray(json) ? (json as ParsedRow[]) : [json as ParsedRow];
    } catch {
      return { rows: [], errors: ["That JSON could not be read. Check for a missing bracket or comma."], warnings };
    }
  } else {
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2)
      return { rows: [], errors: ["CSV needs a header row and at least one data row."], warnings };
    const header = splitCsvLine(lines[0]!).map((h) => h.toLowerCase().replace(/\s+/g, "_"));
    for (const line of lines.slice(1)) {
      const cells = splitCsvLine(line);
      const obj: ParsedRow = {};
      header.forEach((h, i) => (obj[h] = cells[i] ?? ""));
      raw.push(obj);
    }
  }

  const rows: ParsedRow[] = [];
  const seen = new Set<string>();
  raw.forEach((r, idx) => {
    const row = normalise(r);
    const missing = REQUIRED.filter((f) => !row[f]);
    if (missing.length) {
      errors.push(`Row ${idx + 1}: missing ${missing.join(", ")}`);
      return;
    }
    const slug = String(row["slug"]);
    if (!/^[a-z0-9-]+$/.test(slug)) {
      errors.push(`Row ${idx + 1}: slug "${slug}" must be lowercase letters, numbers and hyphens.`);
      return;
    }
    if (seen.has(slug)) {
      errors.push(`Row ${idx + 1}: duplicate slug "${slug}" in this file.`);
      return;
    }
    seen.add(slug);
    if (!row["category"]) warnings.push(`Row ${idx + 1} (${slug}): no category — it will be uncategorised.`);
    if (!row["indications"]) warnings.push(`Row ${idx + 1} (${slug}): no uses listed.`);
    rows.push(row);
  });

  return { rows, errors, warnings };
}

const SAMPLE = `slug,generic_name,display_name,salt,category,indications
example-drug,Example Drug,Example Drug,Example salt,Pain & Fever,Mild pain;Fever`;

function ImportPage() {
  const { isAdmin, loading } = useAuth();
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ inserted: string[]; skipped: { slug: string; reason: string }[] } | null>(
    null,
  );
  const runImport = useServerFn(importMedicines);
  const parsed = useMemo(() => parseInput(input), [input]);

  async function onImport() {
    setBusy(true);
    setResult(null);
    try {
      const res = await runImport({ data: { rows: parsed.rows as never } });
      setResult(res);
      toast.success(`${res.inserted.length} record(s) imported as Draft.`);
    } catch {
      toast.error("The import could not be completed. Check the rows and try again.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">Checking permissions…</p>;

  if (!isAdmin)
    return (
      <div className="surface mx-auto max-w-md p-8 text-center">
        <h1 className="font-display text-xl font-semibold">Admin access required</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Importing medicine records is limited to verified administrators.
        </p>
      </div>
    );

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <Link to="/admin" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline">
          <ArrowLeft className="size-4" /> Back to admin
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold">Import medicines</h1>
        <p className="text-sm text-muted-foreground">
          Paste CSV or JSON. Every imported record is saved as <strong>Draft / Not yet verified</strong> —
          review and verify each one before it becomes public.
        </p>
      </div>

      <div className="surface space-y-3 p-4">
        <label htmlFor="import-data" className="text-sm font-medium">
          CSV or JSON data
        </label>
        <Textarea
          id="import-data"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={10}
          spellCheck={false}
          placeholder={SAMPLE}
          className="font-mono text-xs"
        />
        <p className="text-xs text-muted-foreground">
          Required columns: slug, generic_name, display_name. Optional: salt, active_ingredient,
          category, description, mechanism_of_action, pronunciation_en, indications,
          contraindications, common_adverse_effects, dosage_forms, routes, strengths. Separate list
          values with a semicolon.
        </p>
        <Button variant="outline" size="sm" onClick={() => setInput(SAMPLE)}>
          Load sample
        </Button>
      </div>

      {input.trim() && (
        <div className="surface space-y-3 p-4">
          <h2 className="font-display font-semibold">Preview</h2>
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="secondary">{parsed.rows.length} valid row(s)</Badge>
            {parsed.errors.length > 0 && <Badge variant="destructive">{parsed.errors.length} error(s)</Badge>}
            {parsed.warnings.length > 0 && <Badge variant="outline">{parsed.warnings.length} warning(s)</Badge>}
          </div>

          {parsed.errors.length > 0 && (
            <ul className="space-y-1 text-xs text-destructive">
              {parsed.errors.map((e) => (
                <li key={e} className="flex gap-2">
                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden /> {e}
                </li>
              ))}
            </ul>
          )}
          {parsed.warnings.length > 0 && (
            <ul className="space-y-1 text-xs text-muted-foreground">
              {parsed.warnings.map((w) => (
                <li key={w}>• {w}</li>
              ))}
            </ul>
          )}

          {parsed.rows.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-xs">
                <thead className="text-muted-foreground">
                  <tr>
                    <th className="py-1 pr-3">Slug</th>
                    <th className="py-1 pr-3">Generic</th>
                    <th className="py-1 pr-3">Category</th>
                    <th className="py-1">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {parsed.rows.slice(0, 25).map((r) => (
                    <tr key={String(r["slug"])} className="border-t border-border/60">
                      <td className="py-1 pr-3 font-mono">{String(r["slug"])}</td>
                      <td className="py-1 pr-3">{String(r["generic_name"])}</td>
                      <td className="py-1 pr-3">{String(r["category"] ?? "Not yet verified")}</td>
                      <td className="py-1">
                        <Badge variant="outline">Draft</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Button
            onClick={() => void onImport()}
            disabled={busy || parsed.rows.length === 0}
            className="press-feedback"
          >
            <Upload className="size-4" /> Import {parsed.rows.length} record(s) as Draft
          </Button>
        </div>
      )}

      {result && (
        <div className="surface space-y-2 p-4 text-sm">
          <h2 className="font-display font-semibold">Import summary</h2>
          <p className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-4" aria-hidden /> {result.inserted.length} imported as Draft
          </p>
          {result.skipped.length > 0 && (
            <ul className="space-y-1 text-xs text-muted-foreground">
              {result.skipped.map((s) => (
                <li key={s.slug}>
                  • {s.slug} — {s.reason}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
