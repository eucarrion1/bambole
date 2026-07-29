
-- 1. Enable RLS on store_settings
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- 2. Restrict coupons read to authenticated users
DROP POLICY IF EXISTS "Public read active coupons" ON public.coupons;
CREATE POLICY "Authenticated read active coupons"
  ON public.coupons FOR SELECT
  TO authenticated
  USING (is_active = true);

-- 3. Prevent non-admin self-insert/update/delete on user_roles via RESTRICTIVE policy
CREATE POLICY "Only admins can write roles" ON public.user_roles
  AS RESTRICTIVE
  FOR ALL
  TO authenticated, anon
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Split notifications insert policy
DROP POLICY IF EXISTS "Admins create notifications" ON public.notifications;
CREATE POLICY "Admins create any notification"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users create own notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 5. Tighten newsletter insert policy (replace USING/WITH CHECK true)
DROP POLICY IF EXISTS "Public subscribe newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Public subscribe newsletter"
  ON public.newsletter_subscribers FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL
    AND length(email) BETWEEN 5 AND 255
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND is_active = true
  );

-- 6. Revoke EXECUTE on SECURITY DEFINER functions from PostgREST roles.
-- has_role is still callable inside RLS policies (those run as table owner context),
-- and handle_new_user is invoked only by the auth trigger.
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
