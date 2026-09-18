
-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin','editor','user');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  language_preference text NOT NULL DEFAULT 'en',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name) VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- MANUFACTURERS
CREATE TABLE public.manufacturers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  country text DEFAULT 'India',
  website text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- DRUG CLASSES
CREATE TABLE public.drug_classes (
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
CREATE INDEX drug_classes_parent_idx ON public.drug_classes(parent_id);
CREATE INDEX drug_classes_name_idx ON public.drug_classes(lower(name));

-- MEDICINES
CREATE TABLE public.medicines (
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
CREATE INDEX medicines_generic_idx ON public.medicines(lower(generic_name));
CREATE INDEX medicines_salt_idx ON public.medicines(lower(coalesce(salt,'')));
CREATE INDEX medicines_ingredient_idx ON public.medicines(lower(coalesce(active_ingredient,'')));
CREATE INDEX medicines_category_idx ON public.medicines(category);
CREATE TRIGGER medicines_updated BEFORE UPDATE ON public.medicines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.medicine_classifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_id uuid NOT NULL REFERENCES public.medicines(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.drug_classes(id) ON DELETE CASCADE,
  is_primary boolean NOT NULL DEFAULT false,
  UNIQUE (medicine_id, class_id)
);
CREATE INDEX medclass_class_idx ON public.medicine_classifications(class_id);

CREATE TABLE public.brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name text NOT NULL,
  medicine_id uuid REFERENCES public.medicines(id) ON DELETE CASCADE,
  manufacturer_id uuid REFERENCES public.manufacturers(id) ON DELETE SET NULL,
  composition text,
  strength text,
  dosage_form text,
  route text,
  source text,
  verified boolean NOT NULL DEFAULT false,
  last_verified date,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX brands_name_idx ON public.brands(lower(brand_name));
CREATE INDEX brands_medicine_idx ON public.brands(medicine_id);

CREATE TABLE public.medical_terms (
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
CREATE INDEX medical_terms_term_idx ON public.medical_terms(lower(term));

CREATE TABLE public.suffix_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  suffix text NOT NULL UNIQUE,
  meaning text NOT NULL,
  class_hint text,
  examples text[],
  note text
);

CREATE TABLE public.mnemonics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  explanation text,
  medicine_id uuid REFERENCES public.medicines(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.drug_classes(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.flashcards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  topic text NOT NULL DEFAULT 'general',
  difficulty text NOT NULL DEFAULT 'medium',
  medicine_id uuid REFERENCES public.medicines(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.drug_classes(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX flashcards_topic_idx ON public.flashcards(topic);

CREATE TABLE public.quiz_questions (
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
CREATE INDEX quiz_topic_idx ON public.quiz_questions(topic);

CREATE TABLE public.references (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name text NOT NULL,
  source_type text,
  source_url text,
  published_date date,
  accessed_date date,
  notes text
);

CREATE TABLE public.medicine_references (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_id uuid NOT NULL REFERENCES public.medicines(id) ON DELETE CASCADE,
  reference_id uuid NOT NULL REFERENCES public.references(id) ON DELETE CASCADE,
  UNIQUE (medicine_id, reference_id)
);

CREATE TABLE public.drug_interactions (
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
CREATE INDEX interactions_a_idx ON public.drug_interactions(medicine_a_id);
CREATE INDEX interactions_b_idx ON public.drug_interactions(medicine_b_id);

CREATE TABLE public.dosages (
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

-- public read content
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['manufacturers','drug_classes','medicines','medicine_classifications','brands','medical_terms','suffix_patterns','mnemonics','flashcards','quiz_questions','references','medicine_references','drug_interactions','dosages']
  LOOP
    EXECUTE format('GRANT SELECT ON public.%I TO anon, authenticated;', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role;', t);
    EXECUTE format('GRANT INSERT, UPDATE, DELETE ON public.%I TO authenticated;', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('CREATE POLICY "public read" ON public.%I FOR SELECT USING (true);', t);
    EXECUTE format('CREATE POLICY "admin write" ON public.%I FOR ALL TO authenticated USING (public.has_role(auth.uid(),''admin'')) WITH CHECK (public.has_role(auth.uid(),''admin''));', t);
  END LOOP;
END $$;

-- USER DATA
CREATE TABLE public.user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type text NOT NULL,
  item_id text NOT NULL,
  label text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_type, item_id)
);

CREATE TABLE public.recently_viewed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type text NOT NULL,
  item_id text NOT NULL,
  label text,
  viewed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_type, item_id)
);

CREATE TABLE public.learning_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  topic text,
  item_id text,
  score integer,
  total integer,
  completed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.review_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flashcard_id uuid NOT NULL REFERENCES public.flashcards(id) ON DELETE CASCADE,
  first_studied timestamptz NOT NULL DEFAULT now(),
  last_reviewed timestamptz,
  review_count integer NOT NULL DEFAULT 0,
  correct_count integer NOT NULL DEFAULT 0,
  incorrect_count integer NOT NULL DEFAULT 0,
  difficulty text NOT NULL DEFAULT 'medium',
  interval_days integer NOT NULL DEFAULT 1,
  next_review date NOT NULL DEFAULT current_date,
  UNIQUE (user_id, flashcard_id)
);
CREATE INDEX review_next_idx ON public.review_schedule(user_id, next_review);

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['user_favorites','recently_viewed','learning_progress','review_schedule']
  LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated;', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role;', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('CREATE POLICY "own rows" ON public.%I FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);', t);
  END LOOP;
END $$;

CREATE TABLE public.admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  table_name text,
  record_id text,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.admin_audit_logs TO authenticated;
GRANT ALL ON public.admin_audit_logs TO service_role;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read audit" ON public.admin_audit_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins write audit" ON public.admin_audit_logs FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- Public reference tables: world-readable, admin-writable (RLS enforces admin)
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['medicines','drug_classes','medicine_classifications','brands','manufacturers','medical_terms','suffix_patterns','mnemonics','flashcards','quiz_questions','references','medicine_references','drug_interactions','dosages']
  LOOP
    EXECUTE format('GRANT SELECT ON public.%I TO anon', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
  END LOOP;

  -- User-owned tables: authenticated only, RLS scopes to auth.uid()
  FOREACH t IN ARRAY ARRAY['profiles','user_favorites','recently_viewed','learning_progress','review_schedule']
  LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
  END LOOP;
END $$;

-- Roles: readable by signed-in users (RLS restricts rows); never client-writable
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

-- Audit log: admin read + append only (RLS enforces admin)
GRANT SELECT, INSERT ON public.admin_audit_logs TO authenticated;
GRANT ALL ON public.admin_audit_logs TO service_role;

CREATE TABLE public.ai_rate_limits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bucket_key text NOT NULL,
  window_start timestamp with time zone NOT NULL,
  request_count integer NOT NULL DEFAULT 0,
  last_request_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (bucket_key, window_start)
);

GRANT ALL ON public.ai_rate_limits TO service_role;

ALTER TABLE public.ai_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "no direct access" ON public.ai_rate_limits FOR SELECT TO authenticated USING (false);

CREATE TRIGGER ai_rate_limits_updated BEFORE UPDATE ON public.ai_rate_limits
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

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

  RETURN jsonb_build_object('allowed', true, 'remaining', _limit - _row.request_count - 1);
END; $$;

REVOKE ALL ON FUNCTION public.consume_ai_rate_limit(text, integer, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_ai_rate_limit(text, integer, integer, integer) TO service_role;

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_medicines_generic_trgm ON public.medicines USING gin (generic_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_medicines_display_trgm ON public.medicines USING gin (display_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_medicines_salt_trgm ON public.medicines USING gin (salt gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_medicines_ingredient_trgm ON public.medicines USING gin (active_ingredient gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_medicines_category ON public.medicines (category);
CREATE INDEX IF NOT EXISTS idx_medicines_status ON public.medicines (status);
CREATE INDEX IF NOT EXISTS idx_medicines_synonyms ON public.medicines USING gin (synonyms);
CREATE INDEX IF NOT EXISTS idx_brands_name_trgm ON public.brands USING gin (brand_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_brands_medicine ON public.brands (medicine_id);
CREATE INDEX IF NOT EXISTS idx_brands_manufacturer ON public.brands (manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_classes_name_trgm ON public.drug_classes USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_classes_parent ON public.drug_classes (parent_id);
CREATE INDEX IF NOT EXISTS idx_manufacturers_name_trgm ON public.manufacturers USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_terms_term_trgm ON public.medical_terms USING gin (term gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_medclass_class ON public.medicine_classifications (class_id);
CREATE INDEX IF NOT EXISTS idx_medclass_medicine ON public.medicine_classifications (medicine_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_topic ON public.flashcards (topic);
CREATE INDEX IF NOT EXISTS idx_quiz_topic ON public.quiz_questions (topic);
CREATE INDEX IF NOT EXISTS idx_progress_user ON public.learning_progress (user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_recent_user ON public.recently_viewed (user_id, viewed_at DESC);

CREATE TABLE IF NOT EXISTS public.safety_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  medicine_id uuid REFERENCES public.medicines(id) ON DELETE SET NULL,
  class_id uuid REFERENCES public.drug_classes(id) ON DELETE SET NULL,
  severity text NOT NULL DEFAULT 'information',
  source_name text,
  source_url text,
  alert_date date,
  status text NOT NULL DEFAULT 'draft',
  verification_status text NOT NULL DEFAULT 'unverified',
  last_verified date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.safety_alerts TO anon;
GRANT SELECT ON public.safety_alerts TO authenticated;
GRANT ALL ON public.safety_alerts TO service_role;

ALTER TABLE public.safety_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published verified alerts"
ON public.safety_alerts FOR SELECT
USING (status = 'published' AND verification_status = 'verified');

CREATE POLICY "Admins manage safety alerts"
ON public.safety_alerts FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER safety_alerts_updated
BEFORE UPDATE ON public.safety_alerts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_safety_alerts_medicine ON public.safety_alerts (medicine_id);
CREATE INDEX IF NOT EXISTS idx_safety_alerts_status ON public.safety_alerts (status, verification_status);

CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION pg_trgm SET SCHEMA extensions;
GRANT USAGE ON SCHEMA extensions TO anon, authenticated, service_role;
