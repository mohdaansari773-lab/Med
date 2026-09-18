import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/**
 * Retrieval step for the AI learning assistant: pulls the *verified structured
 * record* out of the database so the model explains real data instead of
 * inventing it. Read-only, publishable key, RLS applies as anon.
 */
function client() {
  const key = (process.env["SUPABASE_PUBLISHABLE_KEY"] ||
    process.env["VITE_SUPABASE_PUBLISHABLE_KEY"])!;
  const url = (process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"])!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`)
          h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

function lines(label: string, value: unknown): string {
  if (value == null) return "";
  if (Array.isArray(value)) return value.length ? `${label}: ${value.join("; ")}\n` : "";
  const s = String(value).trim();
  return s ? `${label}: ${s}\n` : "";
}

/** Builds a compact grounding block from medicines / classes / terms matching the topic. */
export async function retrieveContext(topic: string): Promise<string> {
  const t = topic
    .trim()
    .slice(0, 80)
    .replace(/[,()"'*%\\]/g, " ")
    .trim();
  if (t.length < 2) return "";
  const sb = client();
  const like = `%${t}%`;

  const [meds, classes, terms] = await Promise.all([
    sb
      .from("medicines")
      .select("*")
      .or(`generic_name.ilike.${like},display_name.ilike.${like},salt.ilike.${like}`)
      .in("status", ["published", "active"])
      .limit(3),
    sb.from("drug_classes").select("*").ilike("name", like).limit(3),
    sb
      .from("medical_terms")
      .select("term, simple_definition, clinical_definition")
      .ilike("term", like)
      .limit(3),
  ]);

  let out = "";
  for (const m of meds.data ?? []) {
    out += `--- MEDICINE: ${m.display_name} ---\n`;
    out += lines("Generic", m.generic_name);
    out += lines("Salt/active ingredient", m.salt ?? m.active_ingredient);
    out += lines("Category", m.category);
    out += lines("Mechanism of action", m.mechanism_of_action);
    out += lines("Pharmacodynamics", m.pharmacodynamics);
    out += lines("Absorption", m.absorption);
    out += lines("Distribution", m.distribution);
    out += lines("Metabolism", m.metabolism);
    out += lines("Excretion", m.excretion);
    out += lines("Half-life", m.half_life);
    out += lines("Indications", m.indications);
    out += lines("Contraindications", m.contraindications);
    out += lines("Precautions", m.precautions);
    out += lines("Common adverse effects", m.common_adverse_effects);
    out += lines("Serious adverse effects", m.serious_adverse_effects);
    out += lines("Drug interactions", m.drug_interactions);
    out += lines("Monitoring", m.monitoring);
    out += lines("Key points", m.key_points);
    out += lines("Memory trick", m.memory_trick);
    out += lines("Verification status", m.verification_status);
  }
  for (const c of classes.data ?? []) {
    out += `--- DRUG CLASS: ${c.name} (${c.class_type}) ---\n`;
    out += lines("Simple explanation", c.simple_explanation);
    out += lines("Clinical definition", c.clinical_definition);
    out += lines("Mechanism", c.mechanism);
    out += lines("Common uses", c.common_uses);
    out += lines("Key adverse effects", c.key_adverse_effects);
    out += lines("Contraindications", c.contraindications);
    out += lines("Advantages", c.advantages);
    out += lines("Disadvantages", c.disadvantages);
    out += lines("Key suffix", c.key_suffix);
  }
  for (const term of terms.data ?? []) {
    out += `--- TERM: ${term.term} ---\n`;
    out += lines("Simple", term.simple_definition);
    out += lines("Clinical", term.clinical_definition);
  }

  return out.slice(0, 9000);
}
