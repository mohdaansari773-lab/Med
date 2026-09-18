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