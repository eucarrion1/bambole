
ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS primary_color text,
  ADD COLUMN IF NOT EXISTS accent_color text,
  ADD COLUMN IF NOT EXISTS secondary_color text;

INSERT INTO storage.buckets (id, name, public)
VALUES ('branding', 'branding', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Branding public read" ON storage.objects;
CREATE POLICY "Branding public read" ON storage.objects FOR SELECT USING (bucket_id = 'branding');

DROP POLICY IF EXISTS "Branding admin write" ON storage.objects;
CREATE POLICY "Branding admin write" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'branding' AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','manager')));

DROP POLICY IF EXISTS "Branding admin update" ON storage.objects;
CREATE POLICY "Branding admin update" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'branding' AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','manager')));

DROP POLICY IF EXISTS "Branding admin delete" ON storage.objects;
CREATE POLICY "Branding admin delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'branding' AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','manager')));
