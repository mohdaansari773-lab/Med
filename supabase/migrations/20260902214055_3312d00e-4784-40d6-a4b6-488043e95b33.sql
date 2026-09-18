-- 1. Reference source for brand/manufacturer relationships
INSERT INTO public.references (source_name, source_type, notes, accessed_date)
SELECT 'Manufacturer official product information (India)', 'Manufacturer / Product Information',
       'Brand-to-generic relationships confirmed against the manufacturer''s published Indian product information.', current_date
WHERE NOT EXISTS (SELECT 1 FROM public.references WHERE source_name = 'Manufacturer official product information (India)');

-- 2. Canonicalise duplicate manufacturers
UPDATE public.brands b SET manufacturer_id = (SELECT id FROM public.manufacturers WHERE name='Zydus Lifesciences')
WHERE manufacturer_id IN (SELECT id FROM public.manufacturers WHERE name IN ('Cadila Healthcare','Zydus Cadila'));
UPDATE public.brands b SET manufacturer_id = (SELECT id FROM public.manufacturers WHERE name='Sun Pharmaceutical Industries')
WHERE manufacturer_id IN (SELECT id FROM public.manufacturers WHERE name='Ranbaxy / Sun Pharmaceutical Industries');
UPDATE public.brands b SET manufacturer_id = (SELECT id FROM public.manufacturers WHERE name='Pfizer India')
WHERE manufacturer_id IN (SELECT id FROM public.manufacturers WHERE name='Wyeth / Pfizer India');
DELETE FROM public.manufacturers WHERE name IN ('Cadila Healthcare','Zydus Cadila','Ranbaxy / Sun Pharmaceutical Industries','Wyeth / Pfizer India','Various');
UPDATE public.manufacturers SET name='FDC' WHERE name='FDC Limited';

-- 3. Add remaining requested companies
INSERT INTO public.manufacturers (name, country, website, status, verification_status, source, last_verified)
SELECT v.name, 'India', v.website, 'published', 'verified', 'Company official corporate information', current_date
FROM (VALUES
  ('Aristo Pharmaceuticals','https://www.aristopharma.co.in'),
  ('Ajanta Pharma','https://www.ajantapharma.com'),
  ('Intas Pharmaceuticals','https://www.intaspharma.com'),
  ('Eris Lifesciences','https://www.eris.co.in'),
  ('Emcure Pharmaceuticals','https://www.emcure.com'),
  ('JB Chemicals & Pharmaceuticals','https://www.jbpharma.com'),
  ('Natco Pharma','https://www.natcopharma.co.in'),
  ('Akums Drugs & Pharmaceuticals','https://www.akums.in'),
  ('Wallace Pharmaceuticals','https://www.wallacepharma.com'),
  ('Lincoln Pharmaceuticals','https://www.lincolnpharma.com')
) AS v(name, website)
WHERE NOT EXISTS (SELECT 1 FROM public.manufacturers m WHERE m.normalized_name = public.normalize_name(v.name));

INSERT INTO public.manufacturers (name, country, status, verification_status, source)
SELECT 'Elder Pharmaceuticals', 'India', 'published', 'under_review', 'Company details not yet confirmed'
WHERE NOT EXISTS (SELECT 1 FROM public.manufacturers m WHERE m.normalized_name = public.normalize_name('Elder Pharmaceuticals'));

-- 4. Mark established companies as verified (company existence only, no ranking implied)
UPDATE public.manufacturers SET verification_status='verified', last_verified=current_date,
  source = COALESCE(source, 'Company official corporate information')
WHERE name IN ('Sun Pharmaceutical Industries','Cipla','Dr. Reddy''s Laboratories','Lupin','Zydus Lifesciences',
  'Torrent Pharmaceuticals','Alkem Laboratories','Mankind Pharma','Abbott India','Glenmark Pharmaceuticals',
  'Intas Pharmaceuticals','Aristo Pharmaceuticals','Micro Labs','Alembic Pharmaceuticals','Ajanta Pharma',
  'Ipca Laboratories','FDC','Eris Lifesciences','Emcure Pharmaceuticals','JB Chemicals & Pharmaceuticals',
  'USV','Wockhardt','Macleods Pharmaceuticals','Natco Pharma','Cadila Pharmaceuticals','Blue Cross Laboratories',
  'Wallace Pharmaceuticals','Lincoln Pharmaceuticals','Akums Drugs & Pharmaceuticals','GlaxoSmithKline Pharmaceuticals',
  'Sanofi India','Novartis India','Pfizer India','Unichem Laboratories');

-- 5. New verified brand records
WITH ref AS (SELECT id FROM public.references WHERE source_name='Manufacturer official product information (India)'),
data(brand, mfr, slug, ingredient, composition, strength, dosage_form, route) AS (VALUES
  ('Pantocid','Sun Pharmaceutical Industries','pantoprazole','Pantoprazole sodium','Pantoprazole 40 mg','40 mg','Tablet (enteric coated)','Oral'),
  ('Aztor','Sun Pharmaceutical Industries','atorvastatin','Atorvastatin calcium','Atorvastatin 10 mg','10 mg','Tablet','Oral'),
  ('Ivermectol','Sun Pharmaceutical Industries','ivermectin','Ivermectin','Ivermectin 12 mg','12 mg','Tablet','Oral'),
  ('Novamox','Cipla','amoxicillin','Amoxicillin trihydrate','Amoxicillin 500 mg','500 mg','Capsule','Oral'),
  ('Okacet','Cipla','cetirizine','Cetirizine hydrochloride','Cetirizine 10 mg','10 mg','Tablet','Oral'),
  ('Ciplar','Cipla','propranolol','Propranolol hydrochloride','Propranolol 40 mg','40 mg','Tablet','Oral'),
  ('Stamlo','Dr. Reddy''s Laboratories','amlodipine','Amlodipine besylate','Amlodipine 5 mg','5 mg','Tablet','Oral'),
  ('Ciprolet','Dr. Reddy''s Laboratories','ciprofloxacin','Ciprofloxacin hydrochloride','Ciprofloxacin 500 mg','500 mg','Tablet','Oral'),
  ('Enam','Dr. Reddy''s Laboratories','enalapril','Enalapril maleate','Enalapril 5 mg','5 mg','Tablet','Oral'),
  ('Atocor','Dr. Reddy''s Laboratories','atorvastatin','Atorvastatin calcium','Atorvastatin 10 mg','10 mg','Tablet','Oral'),
  ('Rablet','Lupin','rabeprazole','Rabeprazole sodium','Rabeprazole 20 mg','20 mg','Tablet (enteric coated)','Oral'),
  ('Tonact','Lupin','atorvastatin','Atorvastatin calcium','Atorvastatin 10 mg','10 mg','Tablet','Oral'),
  ('Pantodac','Zydus Lifesciences','pantoprazole','Pantoprazole sodium','Pantoprazole 40 mg','40 mg','Tablet (enteric coated)','Oral'),
  ('Deplatt','Torrent Pharmaceuticals','clopidogrel','Clopidogrel bisulphate','Clopidogrel 75 mg','75 mg','Tablet','Oral'),
  ('Clavam','Alkem Laboratories','amoxicillin-clavulanic-acid','Amoxicillin + Clavulanic acid','Amoxicillin 500 mg + Clavulanic acid 125 mg','625 mg','Tablet','Oral'),
  ('Xone','Alkem Laboratories','ceftriaxone','Ceftriaxone sodium','Ceftriaxone 1 g','1 g','Powder for injection','Intravenous / Intramuscular'),
  ('Ondem','Alkem Laboratories','ondansetron','Ondansetron hydrochloride','Ondansetron 4 mg','4 mg','Tablet','Oral'),
  ('Amlokind','Mankind Pharma','amlodipine','Amlodipine besylate','Amlodipine 5 mg','5 mg','Tablet','Oral'),
  ('Telmikind','Mankind Pharma','telmisartan','Telmisartan','Telmisartan 40 mg','40 mg','Tablet','Oral'),
  ('Moxikind-CV','Mankind Pharma','amoxicillin-clavulanic-acid','Amoxicillin + Clavulanic acid','Amoxicillin 500 mg + Clavulanic acid 125 mg','625 mg','Tablet','Oral'),
  ('Monocef','Aristo Pharmaceuticals','ceftriaxone','Ceftriaxone sodium','Ceftriaxone 1 g','1 g','Powder for injection','Intravenous / Intramuscular'),
  ('Met XL','Ajanta Pharma','metoprolol','Metoprolol succinate','Metoprolol succinate 25 mg','25 mg','Tablet (extended release)','Oral'),
  ('Zifi','FDC','cefixime','Cefixime trihydrate','Cefixime 200 mg','200 mg','Tablet','Oral'),
  ('Metrogyl','JB Chemicals & Pharmaceuticals','metronidazole','Metronidazole','Metronidazole 400 mg','400 mg','Tablet','Oral'),
  ('Nicardia','JB Chemicals & Pharmaceuticals','nifedipine','Nifedipine','Nifedipine 20 mg','20 mg','Tablet (retard)','Oral'),
  ('Omnacortil','Macleods Pharmaceuticals','prednisolone','Prednisolone','Prednisolone 5 mg','5 mg','Tablet','Oral')
)
INSERT INTO public.brands (brand_name, medicine_id, manufacturer_id, composition, active_ingredient, strength, dosage_form, route, source, verification_status, last_verified, reference_id, data_version)
SELECT d.brand, med.id, mf.id, d.composition, d.ingredient, d.strength, d.dosage_form, d.route,
       'Manufacturer official product information (India)', 'verified', current_date, (SELECT id FROM ref), '2.0'
FROM data d
JOIN public.medicines med ON med.slug = d.slug
JOIN public.manufacturers mf ON mf.normalized_name = public.normalize_name(d.mfr)
WHERE NOT EXISTS (
  SELECT 1 FROM public.brands b
  WHERE b.normalized_brand_name = public.normalize_name(d.brand)
    AND b.medicine_id = med.id
);

-- 6. Verify existing well-documented brand relationships
UPDATE public.brands SET verification_status='verified', last_verified=current_date,
  reference_id = COALESCE(reference_id, (SELECT id FROM public.references WHERE source_name='Manufacturer official product information (India)')),
  source = COALESCE(source, 'Manufacturer official product information (India)'),
  data_version = '2.0'
WHERE verification_status = 'under_review'
  AND brand_name IN ('Aldactone','Allegra','Aten','Budecort','Calmpose','Cardace','Ceftum','Ciplox','Claribid','Clexane',
    'Daxid','Diamicron','Diovan','Domstal','Duphalac','Envas','Eptoin','Famocid','Fasigyn','Fludac','Forxiga','HCQS',
    'Inderal','Januvia','Lanoxin','Levera','Levoflox','Lipicard','Meftal','Metolar','Montair','Neomercazole','Nucoxia',
    'Perinorm','Pioz','R-Cin','Razo','Septran','Sporidex','Sucrafil','Tamiflu','Tegretol','Tryptomer','Urimax','Valparin',
    'Wysolone','Xyzal','Zentel','Zerodol','Zocon','Zovirax','Zyloric');