CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

COMMENT ON TABLE public.site_settings IS 'Stores site-wide settings as key-value pairs.';
COMMENT ON COLUMN public.site_settings.key IS 'The unique identifier for the setting (e.g., ''site_name'').';
COMMENT ON COLUMN public.site_settings.value IS 'The value of the setting.';

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to site settings"
ON public.site_settings
FOR SELECT
TO anon, authenticated
USING (true);

-- Allow admin write access
CREATE POLICY "Allow admin write access to site settings"
ON public.site_settings
FOR ALL
TO authenticated
USING ((auth.jwt() -> 'app_metadata' ->> 'claims_admin')::boolean IS TRUE);
