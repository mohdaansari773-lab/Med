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
