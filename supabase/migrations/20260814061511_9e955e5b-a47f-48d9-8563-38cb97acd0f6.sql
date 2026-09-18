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