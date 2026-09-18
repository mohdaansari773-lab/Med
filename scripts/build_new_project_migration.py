#!/usr/bin/env python3
import json
import os

def sql_quote(val):
    if val is None:
        return "NULL"
    if isinstance(val, bool):
        return "TRUE" if val else "FALSE"
    if isinstance(val, (int, float)):
        return str(val)
    if isinstance(val, list):
        if not val:
            return "'{}'::text[]"
        escaped_items = []
        for x in val:
            s = str(x).replace("'", "''")
            escaped_items.append(f"'{s}'")
        joined = ", ".join(escaped_items)
        return f"ARRAY[{joined}]::text[]"
    if isinstance(val, dict):
        s = json.dumps(val).replace("'", "''")
        return f"'{s}'::jsonb"
    s = str(val).replace("'", "''")
    return f"'{s}'"

def generate_inserts(table_name, rows, conflict_target="id"):
    if not rows:
        return ""
    
    # Collect all unique columns across all rows
    cols = []
    for r in rows:
        for k in r.keys():
            if k not in cols:
                cols.append(k)
    
    lines = [f"-- Data for {table_name} ({len(rows)} rows)"]
    for row in rows:
        vals = [sql_quote(row.get(c)) for c in cols]
        val_str = ", ".join(vals)
        col_str = ", ".join(cols)
        if conflict_target:
            sql = f"INSERT INTO public.{table_name} ({col_str}) VALUES ({val_str}) ON CONFLICT ({conflict_target}) DO NOTHING;"
        else:
            sql = f"INSERT INTO public.{table_name} ({col_str}) VALUES ({val_str}) ON CONFLICT DO NOTHING;"
        lines.append(sql)
    return "\n".join(lines) + "\n\n"

def main():
    with open("scripts/supabase_source_dump.json") as f:
        source_data = json.load(f)
    with open("scripts/supabase_extra_dump.json") as f:
        extra_data = json.load(f)
    
    sql_parts = []
    
    # Header
    sql_parts.append("""-- =====================================================================
-- COMPLETE MASTER MIGRATION & SEED FOR NEW SUPABASE PROJECT
-- MediVault / MediDex Grow Application Database
-- Includes complete schema, types, functions, triggers, RLS, indexes,
-- and authoritative baseline dataset of 164 medicines & all relations.
-- =====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. ENUMS
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin','editor','user');
  END IF;
END $$;

-- 3. HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.normalize_name(_v text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT nullif(regexp_replace(lower(coalesce(_v, '')), '[^a-z0-9]+', '', 'g'), '');
$$;

-- 4. USER ROLES & PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  language_preference text NOT NULL DEFAULT 'en',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- Self-healing admin bootstrap: The first registered user automatically gets admin role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  admin_count integer;
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)))
  ON CONFLICT (id) DO NOTHING;

  SELECT count(*) INTO admin_count FROM public.user_roles WHERE role = 'admin';
  IF admin_count = 0 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. REFERENCE & TAXONOMY TABLES
CREATE TABLE IF NOT EXISTS public.manufacturers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  normalized_name text NOT NULL DEFAULT '',
  country text DEFAULT 'India',
  website text,
  status text NOT NULL DEFAULT 'active',
  verification_status text NOT NULL DEFAULT 'under_review',
  source text,
  last_verified date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS manufacturers_normalized_name_key ON public.manufacturers (normalized_name);

CREATE TABLE IF NOT EXISTS public.drug_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  class_type text NOT NULL DEFAULT 'pharmacological',
  parent_id uuid REFERENCES public.drug_classes(id) ON DELETE SET NULL,
  atc_code text,
  simple_explanation text,
  hindi_explanation text,
  clinical_definition text,
  mechanism text,
  common_uses text[],
  key_adverse_effects text[],
  contraindications text[],
  advantages text[],
  disadvantages text[],
  key_suffix text,
  status text NOT NULL DEFAULT 'verified',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS drug_classes_parent_idx ON public.drug_classes(parent_id);
CREATE INDEX IF NOT EXISTS drug_classes_name_idx ON public.drug_classes(lower(name));

CREATE TABLE IF NOT EXISTS public.references (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name text NOT NULL,
  source_type text,
  source_url text,
  published_date date,
  accessed_date date,
  notes text
);

-- 6. MEDICINES TABLE (Full 56 columns)
CREATE TABLE IF NOT EXISTS public.medicines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  generic_name text NOT NULL,
  display_name text NOT NULL,
  active_ingredient text,
  salt text,
  synonyms text[],
  description text,
  category text,
  strengths text[],
  dosage_forms text[],
  routes text[],
  mechanism_of_action text,
  pharmacodynamics text,
  absorption text,
  distribution text,
  metabolism text,
  excretion text,
  bioavailability text,
  half_life text,
  protein_binding text,
  volume_of_distribution text,
  clearance text,
  onset text,
  duration text,
  indications text[],
  contraindications text[],
  warnings text[],
  precautions text[],
  common_adverse_effects text[],
  serious_adverse_effects text[],
  drug_interactions text[],
  food_interactions text[],
  monitoring text[],
  storage text,
  patient_counselling text[],
  pregnancy text,
  lactation text,
  pediatric text,
  geriatric text,
  renal text,
  hepatic text,
  advantages text[],
  disadvantages text[],
  key_points text[],
  memory_trick text,
  key_suffix text,
  pronunciation_en text,
  pronunciation_hi text,
  pronunciation_ipa text,
  status text NOT NULL DEFAULT 'active',
  verification_status text NOT NULL DEFAULT 'verified',
  last_verified date,
  data_version text NOT NULL DEFAULT '1.0',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS medicines_generic_idx ON public.medicines(lower(generic_name));
CREATE INDEX IF NOT EXISTS medicines_salt_idx ON public.medicines(lower(coalesce(salt,'')));
CREATE INDEX IF NOT EXISTS medicines_ingredient_idx ON public.medicines(lower(coalesce(active_ingredient,'')));
CREATE INDEX IF NOT EXISTS medicines_category_idx ON public.medicines(category);
CREATE INDEX IF NOT EXISTS medicines_status_idx ON public.medicines(status, verification_status);

CREATE TABLE IF NOT EXISTS public.medicine_classifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_id uuid NOT NULL REFERENCES public.medicines(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.drug_classes(id) ON DELETE CASCADE,
  is_primary boolean NOT NULL DEFAULT false,
  UNIQUE (medicine_id, class_id)
);
CREATE INDEX IF NOT EXISTS medclass_class_idx ON public.medicine_classifications(class_id);

CREATE TABLE IF NOT EXISTS public.brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name text NOT NULL,
  normalized_brand_name text,
  active_ingredient text,
  medicine_id uuid REFERENCES public.medicines(id) ON DELETE CASCADE,
  manufacturer_id uuid REFERENCES public.manufacturers(id) ON DELETE SET NULL,
  composition text,
  strength text,
  dosage_form text,
  route text,
  source text,
  verified boolean NOT NULL DEFAULT false,
  verification_status text NOT NULL DEFAULT 'under_review',
  reference_id uuid REFERENCES public.references(id) ON DELETE SET NULL,
  last_verified date,
  data_version text NOT NULL DEFAULT '1.0',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS brands_name_idx ON public.brands(lower(brand_name));
CREATE INDEX IF NOT EXISTS brands_medicine_idx ON public.brands(medicine_id);

CREATE TABLE IF NOT EXISTS public.medicine_references (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_id uuid NOT NULL REFERENCES public.medicines(id) ON DELETE CASCADE,
  reference_id uuid NOT NULL REFERENCES public.references(id) ON DELETE CASCADE,
  UNIQUE (medicine_id, reference_id)
);

CREATE TABLE IF NOT EXISTS public.drug_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_a_id uuid NOT NULL REFERENCES public.medicines(id) ON DELETE CASCADE,
  medicine_b_id uuid NOT NULL REFERENCES public.medicines(id) ON DELETE CASCADE,
  severity text NOT NULL DEFAULT 'moderate',
  description text NOT NULL,
  mechanism text,
  clinical_significance text,
  professional_consideration text,
  reference_id uuid REFERENCES public.references(id) ON DELETE SET NULL,
  verified boolean NOT NULL DEFAULT true
);
CREATE INDEX IF NOT EXISTS interactions_a_idx ON public.drug_interactions(medicine_a_id);
CREATE INDEX IF NOT EXISTS interactions_b_idx ON public.drug_interactions(medicine_b_id);

CREATE TABLE IF NOT EXISTS public.dosages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_id uuid NOT NULL REFERENCES public.medicines(id) ON DELETE CASCADE,
  indication text,
  age_group text,
  dose text,
  unit text,
  frequency text,
  route text,
  duration text,
  maximum_dose text,
  renal_adjustment text,
  hepatic_consideration text,
  reference_id uuid REFERENCES public.references(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.medical_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  term text NOT NULL,
  category text,
  definition text,
  simple_definition text,
  hindi_explanation text,
  hinglish_explanation text,
  clinical_definition text,
  pronunciation_en text,
  pronunciation_hi text,
  related_terms text[],
  related_medicines text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS medical_terms_term_idx ON public.medical_terms(lower(term));

CREATE TABLE IF NOT EXISTS public.suffix_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  suffix text NOT NULL UNIQUE,
  meaning text NOT NULL,
  class_hint text,
  examples text[],
  note text
);

CREATE TABLE IF NOT EXISTS public.mnemonics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  explanation text,
  medicine_id uuid REFERENCES public.medicines(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.drug_classes(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.flashcards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  topic text NOT NULL DEFAULT 'general',
  difficulty text NOT NULL DEFAULT 'medium',
  medicine_id uuid REFERENCES public.medicines(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.drug_classes(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS flashcards_topic_idx ON public.flashcards(topic);

CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  question_type text NOT NULL DEFAULT 'mcq',
  options text[] NOT NULL DEFAULT '{}',
  correct_answer text NOT NULL,
  explanation text,
  topic text NOT NULL DEFAULT 'pharmacology',
  difficulty text NOT NULL DEFAULT 'medium',
  medicine_id uuid REFERENCES public.medicines(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS quiz_topic_idx ON public.quiz_questions(topic);

CREATE TABLE IF NOT EXISTS public.safety_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_id uuid REFERENCES public.medicines(id) ON DELETE CASCADE,
  title text NOT NULL,
  severity text NOT NULL DEFAULT 'moderate',
  details text NOT NULL,
  clinical_recommendation text,
  source_name text,
  source_url text,
  alert_date date,
  status text NOT NULL DEFAULT 'draft',
  verification_status text NOT NULL DEFAULT 'unverified',
  last_verified date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 7. USER ENGAGEMENT & AUDIT TABLES
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type text NOT NULL,
  item_id text NOT NULL,
  label text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_type, item_id)
);

CREATE TABLE IF NOT EXISTS public.recently_viewed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type text NOT NULL,
  item_id text NOT NULL,
  label text,
  viewed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_type, item_id)
);

CREATE TABLE IF NOT EXISTS public.learning_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  topic text,
  item_id text,
  score integer,
  total integer,
  completed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.review_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type text NOT NULL,
  item_id text NOT NULL,
  box integer NOT NULL DEFAULT 1,
  next_review timestamptz NOT NULL DEFAULT now(),
  last_reviewed timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_type, item_id)
);

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  table_name text,
  record_id text,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_key text NOT NULL UNIQUE,
  request_count integer NOT NULL DEFAULT 0,
  window_start timestamptz NOT NULL DEFAULT now(),
  last_request_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 8. TRIGGERS & SYNC FUNCTIONS
DROP TRIGGER IF EXISTS medicines_updated ON public.medicines;
CREATE TRIGGER medicines_updated BEFORE UPDATE ON public.medicines
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS drug_classes_updated ON public.drug_classes;
CREATE TRIGGER drug_classes_updated BEFORE UPDATE ON public.drug_classes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS profiles_updated ON public.profiles;
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS safety_alerts_updated ON public.safety_alerts;
CREATE TRIGGER safety_alerts_updated BEFORE UPDATE ON public.safety_alerts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.brands_sync_fields()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.normalized_brand_name := public.normalize_name(NEW.brand_name);
  NEW.verified := (NEW.verification_status = 'verified');
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS brands_sync_fields ON public.brands;
CREATE TRIGGER brands_sync_fields BEFORE INSERT OR UPDATE ON public.brands
FOR EACH ROW EXECUTE FUNCTION public.brands_sync_fields();

CREATE OR REPLACE FUNCTION public.manufacturers_sync_fields()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.normalized_name := public.normalize_name(NEW.name);
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS manufacturers_sync_fields ON public.manufacturers;
CREATE TRIGGER manufacturers_sync_fields BEFORE INSERT OR UPDATE ON public.manufacturers
FOR EACH ROW EXECUTE FUNCTION public.manufacturers_sync_fields();

-- AI RATE LIMIT RPC
CREATE OR REPLACE FUNCTION public.consume_ai_rate_limit(
  _key text,
  _limit integer,
  _window_seconds integer,
  _min_interval_ms integer
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _win timestamptz := to_timestamp(floor(extract(epoch from now()) / _window_seconds) * _window_seconds);
  _row public.ai_rate_limits%ROWTYPE;
BEGIN
  DELETE FROM public.ai_rate_limits WHERE window_start < now() - interval '1 day';

  INSERT INTO public.ai_rate_limits (bucket_key, window_start, request_count, last_request_at)
  VALUES (_key, _win, 0, now() - interval '1 day')
  ON CONFLICT (bucket_key, window_start) DO NOTHING;

  SELECT * INTO _row FROM public.ai_rate_limits
   WHERE bucket_key = _key AND window_start = _win FOR UPDATE;

  IF _row.last_request_at > now() - make_interval(secs => _min_interval_ms / 1000.0) THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'too_fast');
  END IF;

  IF _row.request_count >= _limit THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'quota',
      'retry_after_seconds', ceil(extract(epoch from (_win + make_interval(secs => _window_seconds)) - now())));
  END IF;

  UPDATE public.ai_rate_limits
     SET request_count = request_count + 1, last_request_at = now()
   WHERE id = _row.id;

  RETURN jsonb_build_object('allowed', true, 'remaining', _limit - (_row.request_count + 1));
END;
$$;

REVOKE ALL ON FUNCTION public.consume_ai_rate_limit(text, integer, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_ai_rate_limit(text, integer, integer, integer) TO service_role;

-- SEARCH & UNIQUENESS INDEXES
CREATE INDEX IF NOT EXISTS idx_medicines_generic_trgm ON public.medicines USING gin (generic_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_medicines_display_trgm ON public.medicines USING gin (display_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_medicines_synonyms ON public.medicines USING gin (synonyms);
CREATE INDEX IF NOT EXISTS idx_brands_name_trgm ON public.brands USING gin (brand_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_classes_name_trgm ON public.drug_classes USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_manufacturers_name_trgm ON public.manufacturers USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_terms_term_trgm ON public.medical_terms USING gin (term gin_trgm_ops);

CREATE UNIQUE INDEX IF NOT EXISTS brands_unique_identity
  ON public.brands (
    normalized_brand_name,
    coalesce(manufacturer_id, '00000000-0000-0000-0000-000000000000'::uuid),
    coalesce(medicine_id, '00000000-0000-0000-0000-000000000000'::uuid),
    coalesce(lower(strength), '')
  );

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recently_viewed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_alerts ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

DROP POLICY IF EXISTS "read own roles" ON public.user_roles;
CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "admins manage roles" ON public.user_roles;
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "own profile" ON public.profiles;
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated
USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Public Reference Tables RLS
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['manufacturers','drug_classes','medicines','medicine_classifications','brands','medical_terms','suffix_patterns','mnemonics','flashcards','quiz_questions','references','medicine_references','drug_interactions','dosages']
  LOOP
    EXECUTE format('GRANT SELECT ON public.%I TO anon, authenticated;', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role;', t);
    EXECUTE format('GRANT INSERT, UPDATE, DELETE ON public.%I TO authenticated;', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('DROP POLICY IF EXISTS "public read" ON public.%I;', t);
    EXECUTE format('CREATE POLICY "public read" ON public.%I FOR SELECT USING (true);', t);
    EXECUTE format('DROP POLICY IF EXISTS "admin write" ON public.%I;', t);
    EXECUTE format('CREATE POLICY "admin write" ON public.%I FOR ALL TO authenticated USING (public.has_role(auth.uid(),''admin'')) WITH CHECK (public.has_role(auth.uid(),''admin''));', t);
  END LOOP;
END $$;

-- User-scoped Tables RLS
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['user_favorites','recently_viewed','learning_progress','review_schedule']
  LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated;', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role;', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('DROP POLICY IF EXISTS "own rows" ON public.%I;', t);
    EXECUTE format('CREATE POLICY "own rows" ON public.%I FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);', t);
  END LOOP;
END $$;

-- Safety alerts policies
DROP POLICY IF EXISTS "Public can read published verified alerts" ON public.safety_alerts;
CREATE POLICY "Public can read published verified alerts" ON public.safety_alerts FOR SELECT
USING (status = 'published' AND verification_status = 'verified');

DROP POLICY IF EXISTS "Admins manage safety alerts" ON public.safety_alerts;
CREATE POLICY "Admins manage safety alerts" ON public.safety_alerts FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admin audit logs policies
DROP POLICY IF EXISTS "admins read audit" ON public.admin_audit_logs;
CREATE POLICY "admins read audit" ON public.admin_audit_logs FOR SELECT TO authenticated
USING (public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "admins write audit" ON public.admin_audit_logs;
CREATE POLICY "admins write audit" ON public.admin_audit_logs FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(),'admin'));
""")

    # Data inserts in exact foreign-key order:
    # 1. references
    # 2. manufacturers
    # 3. drug_classes
    # 4. medicines
    # 5. medicine_classifications
    # 6. brands
    # 7. medicine_references
    # 8. medical_terms
    # 9. suffix_patterns
    # 10. mnemonics
    # 11. flashcards
    # 12. quiz_questions
    # 13. drug_interactions
    sql_parts.append(generate_inserts("references", source_data.get("references", []), "id"))
    sql_parts.append(generate_inserts("manufacturers", source_data.get("manufacturers", []), "name"))
    sql_parts.append(generate_inserts("drug_classes", source_data.get("drug_classes", []), "slug"))
    sql_parts.append(generate_inserts("medicines", source_data.get("medicines", []), "slug"))
    sql_parts.append(generate_inserts("medicine_classifications", source_data.get("medicine_classifications", []), "medicine_id, class_id"))
    sql_parts.append(generate_inserts("brands", source_data.get("brands", []), "id"))
    sql_parts.append(generate_inserts("medicine_references", source_data.get("medicine_references", []), "medicine_id, reference_id"))
    sql_parts.append(generate_inserts("medical_terms", source_data.get("medical_terms", []), "slug"))
    sql_parts.append(generate_inserts("suffix_patterns", extra_data.get("suffix_patterns", []), "suffix"))
    sql_parts.append(generate_inserts("mnemonics", extra_data.get("mnemonics", []), "id"))
    sql_parts.append(generate_inserts("flashcards", extra_data.get("flashcards", []), "id"))
    sql_parts.append(generate_inserts("quiz_questions", extra_data.get("quiz_questions", []), "id"))
    sql_parts.append(generate_inserts("drug_interactions", extra_data.get("drug_interactions", []), "id"))
    
    full_sql = "\n".join(sql_parts)
    out_path = "supabase/migrations/20260918120000_init_new_supabase_project.sql"
    with open(out_path, "w") as f:
        f.write(full_sql)
    
    print(f"Successfully generated {out_path} ({os.path.getsize(out_path)} bytes)")

if __name__ == "__main__":
    main()
