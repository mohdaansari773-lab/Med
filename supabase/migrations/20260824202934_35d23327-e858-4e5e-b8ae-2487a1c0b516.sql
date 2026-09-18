-- helper -------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.normalize_name(_v text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT nullif(regexp_replace(lower(coalesce(_v, '')), '[^a-z0-9]+', '', 'g'), '')
$$;

-- manufacturers --------------------------------------------------------------
ALTER TABLE public.manufacturers
  ADD COLUMN IF NOT EXISTS normalized_name text,
  ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'under_review',
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS last_verified date,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- merge duplicate companies that differ only by punctuation/spacing
WITH d AS (
  SELECT id, public.normalize_name(name) AS n,
         row_number() OVER (PARTITION BY public.normalize_name(name) ORDER BY created_at, id) AS rn
  FROM public.manufacturers
), keep AS (SELECT n, id FROM d WHERE rn = 1)
UPDATE public.brands b
SET manufacturer_id = keep.id
FROM d JOIN keep ON keep.n = d.n
WHERE b.manufacturer_id = d.id AND d.rn > 1;

WITH d AS (
  SELECT id, row_number() OVER (PARTITION BY public.normalize_name(name) ORDER BY created_at, id) AS rn
  FROM public.manufacturers
)
DELETE FROM public.manufacturers m USING d WHERE m.id = d.id AND d.rn > 1;

UPDATE public.manufacturers SET normalized_name = public.normalize_name(name)
WHERE normalized_name IS DISTINCT FROM public.normalize_name(name);

ALTER TABLE public.manufacturers ALTER COLUMN normalized_name SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS manufacturers_normalized_name_key
  ON public.manufacturers (normalized_name);

ALTER TABLE public.manufacturers DROP CONSTRAINT IF EXISTS manufacturers_verification_status_check;
ALTER TABLE public.manufacturers ADD CONSTRAINT manufacturers_verification_status_check
  CHECK (verification_status IN ('draft','under_review','verified','needs_update','archived'));

-- brands ---------------------------------------------------------------------
ALTER TABLE public.brands
  ADD COLUMN IF NOT EXISTS normalized_brand_name text,
  ADD COLUMN IF NOT EXISTS active_ingredient text,
  ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'under_review',
  ADD COLUMN IF NOT EXISTS reference_id uuid REFERENCES public.references(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS data_version text NOT NULL DEFAULT '1.0',
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.brands DROP CONSTRAINT IF EXISTS brands_verification_status_check;
ALTER TABLE public.brands ADD CONSTRAINT brands_verification_status_check
  CHECK (verification_status IN ('draft','under_review','verified','needs_update','archived'));

UPDATE public.brands
SET normalized_brand_name = public.normalize_name(brand_name),
    verification_status = CASE WHEN verified THEN 'verified' ELSE 'under_review' END;

ALTER TABLE public.brands ALTER COLUMN normalized_brand_name SET NOT NULL;

-- keep the legacy boolean in sync with the workflow status, and normalise names
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

-- duplicate protection for brands
CREATE UNIQUE INDEX IF NOT EXISTS brands_unique_identity
  ON public.brands (
    normalized_brand_name,
    coalesce(manufacturer_id, '00000000-0000-0000-0000-000000000000'::uuid),
    coalesce(medicine_id, '00000000-0000-0000-0000-000000000000'::uuid),
    coalesce(lower(strength), '')
  );

CREATE INDEX IF NOT EXISTS idx_brands_verification ON public.brands (verification_status);
CREATE INDEX IF NOT EXISTS idx_manufacturers_verification ON public.manufacturers (verification_status);

-- companies whose products are still awaiting verification (no brands attached)
INSERT INTO public.manufacturers (name, normalized_name, country, status, verification_status, source)
VALUES
  ('HH Pharma', public.normalize_name('HH Pharma'), 'India', 'active', 'under_review', 'Awaiting verification against manufacturer/regulatory product listing'),
  ('Solvate', public.normalize_name('Solvate'), 'India', 'active', 'under_review', 'Awaiting verification against manufacturer/regulatory product listing'),
  ('Leolife', public.normalize_name('Leolife'), 'India', 'active', 'under_review', 'Awaiting verification against manufacturer/regulatory product listing'),
  ('Trigar', public.normalize_name('Trigar'), 'India', 'active', 'under_review', 'Awaiting verification against manufacturer/regulatory product listing'),
  ('Bennet', public.normalize_name('Bennet'), 'India', 'active', 'under_review', 'Awaiting verification against manufacturer/regulatory product listing')
ON CONFLICT (normalized_name) DO NOTHING;

-- a company reads as verified only when it has at least one verified brand
UPDATE public.manufacturers m
SET verification_status = 'verified', last_verified = CURRENT_DATE
WHERE EXISTS (SELECT 1 FROM public.brands b WHERE b.manufacturer_id = m.id AND b.verification_status = 'verified');

GRANT SELECT ON public.manufacturers TO anon, authenticated;
GRANT SELECT ON public.brands TO anon, authenticated;
GRANT ALL ON public.manufacturers TO service_role;
GRANT ALL ON public.brands TO service_role;