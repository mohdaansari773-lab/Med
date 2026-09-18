import { z } from "zod";

const text = z
  .string()
  .trim()
  .max(8000)
  .nullish()
  .transform((v) => (v ? v : null));

const shortText = z
  .string()
  .trim()
  .max(400)
  .nullish()
  .transform((v) => (v ? v : null));

const stringList = z
  .union([
    z.array(z.string().trim().min(1).max(1000)),
    z.string().transform((str) =>
      str
        .split(/[;\n]/)
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  ])
  .nullish()
  .transform((v) => (v && v.length > 0 ? v : null));

export const CanonicalMedicineSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase alphanumeric characters and hyphens"),
  generic_name: z.string().trim().min(2).max(200),
  display_name: z.string().trim().min(2).max(200),
  active_ingredient: shortText,
  salt: shortText,
  synonyms: stringList,
  description: text,
  category: shortText,
  strengths: stringList,
  dosage_forms: stringList,
  routes: stringList,
  mechanism_of_action: text,
  pharmacodynamics: text,
  absorption: text,
  distribution: text,
  metabolism: text,
  excretion: text,
  bioavailability: shortText,
  half_life: shortText,
  protein_binding: shortText,
  volume_of_distribution: shortText,
  clearance: shortText,
  onset: shortText,
  duration: shortText,
  indications: stringList,
  contraindications: stringList,
  warnings: stringList,
  precautions: stringList,
  common_adverse_effects: stringList,
  serious_adverse_effects: stringList,
  drug_interactions: stringList,
  food_interactions: stringList,
  monitoring: stringList,
  storage: text,
  patient_counselling: stringList,
  pregnancy: text,
  lactation: text,
  pediatric: text,
  geriatric: text,
  renal: text,
  hepatic: text,
  advantages: stringList,
  disadvantages: stringList,
  key_points: stringList,
  memory_trick: text,
  key_suffix: shortText,
  pronunciation_en: shortText,
  pronunciation_hi: shortText,
  pronunciation_ipa: shortText,
  status: z.enum(["published", "draft", "archived"]).default("draft"),
  verification_status: z.enum(["verified", "unverified", "needs_review"]).default("unverified"),
  last_verified: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullish()
    .transform((v) => v ?? null),
  data_version: z.string().trim().min(1).max(20).default("1.0"),
});

export type CanonicalMedicine = z.infer<typeof CanonicalMedicineSchema>;

/**
 * Validates an array of medicine objects, returning valid records and detailed errors.
 */
export function validateMedicineBatch(records: unknown[]): {
  valid: CanonicalMedicine[];
  errors: { index: number; slug?: string; error: string }[];
} {
  const valid: CanonicalMedicine[] = [];
  const errors: { index: number; slug?: string; error: string }[] = [];
  const seenSlugs = new Set<string>();

  records.forEach((record, index) => {
    const result = CanonicalMedicineSchema.safeParse(record);
    if (!result.success) {
      const issue = result.error.issues[0]?.message ?? "Invalid data schema";
      const slug =
        typeof record === "object" && record !== null && "slug" in record
          ? String((record as { slug: unknown }).slug)
          : undefined;
      errors.push({ index, ...(slug ? { slug } : {}), error: issue });
      return;
    }

    if (seenSlugs.has(result.data.slug)) {
      errors.push({
        index,
        slug: result.data.slug,
        error: `Duplicate slug '${result.data.slug}' within batch`,
      });
      return;
    }

    seenSlugs.add(result.data.slug);
    valid.push(result.data);
  });

  return { valid, errors };
}

/**
 * Parses CSV text where list fields are separated by semicolons into CanonicalMedicine records.
 */
export function parseMedicinesFromCsv(csvContent: string): CanonicalMedicine[] {
  const lines = csvContent.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0]!.split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const rawRows: Record<string, unknown>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]!.trim();
    if (!line) continue;

    // Simple CSV tokenizer respecting quotes
    const values: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"' && line[j + 1] === '"') {
        cur += '"';
        j++;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(cur.trim());
        cur = "";
      } else {
        cur += char;
      }
    }
    values.push(cur.trim());

    const rowObj: Record<string, unknown> = {};
    headers.forEach((h, idx) => {
      rowObj[h] = values[idx] ?? null;
    });
    rawRows.push(rowObj);
  }

  const { valid } = validateMedicineBatch(rawRows);
  return valid;
}

/**
 * Converts canonical medicine records into PostgreSQL INSERT statements for SQL seed scripts.
 */
export function generateSqlSeedStatements(medicines: CanonicalMedicine[]): string {
  if (!medicines.length) return "";

  const escapeSql = (val: unknown): string => {
    if (val === null || val === undefined) return "NULL";
    if (Array.isArray(val)) {
      const items = val.map((v) => `"${String(v).replace(/"/g, '\\"')}"`).join(",");
      return `'${`{${items}}`.replace(/'/g, "''")}'::text[]`;
    }
    return `'${String(val).replace(/'/g, "''")}'`;
  };

  const columns = [
    "slug",
    "generic_name",
    "display_name",
    "active_ingredient",
    "salt",
    "synonyms",
    "description",
    "category",
    "strengths",
    "dosage_forms",
    "routes",
    "mechanism_of_action",
    "pharmacodynamics",
    "absorption",
    "distribution",
    "metabolism",
    "excretion",
    "bioavailability",
    "half_life",
    "onset",
    "duration",
    "indications",
    "contraindications",
    "warnings",
    "precautions",
    "common_adverse_effects",
    "serious_adverse_effects",
    "drug_interactions",
    "food_interactions",
    "monitoring",
    "storage",
    "patient_counselling",
    "pregnancy",
    "lactation",
    "pediatric",
    "geriatric",
    "renal",
    "hepatic",
    "advantages",
    "disadvantages",
    "key_points",
    "memory_trick",
    "key_suffix",
    "pronunciation_en",
    "status",
    "verification_status",
    "data_version",
  ];

  const rows = medicines.map((m) => {
    const vals = columns.map((col) => escapeSql((m as Record<string, unknown>)[col]));
    return `(${vals.join(", ")})`;
  });

  return `INSERT INTO public.medicines (\n  ${columns.join(",\n  ")}\n)\nVALUES\n  ${rows.join(",\n  ")}\nON CONFLICT (slug) DO UPDATE SET\n  updated_at = now();`;
}
