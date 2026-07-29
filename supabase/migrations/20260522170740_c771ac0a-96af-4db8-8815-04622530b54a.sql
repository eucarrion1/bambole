
-- Create admin user directly and promote to admin
DO $$
DECLARE
  admin_uid uuid;
  admin_email text := 'administrador@bambole.com.br';
BEGIN
  SELECT id INTO admin_uid FROM auth.users WHERE email = admin_email;

  IF admin_uid IS NULL THEN
    admin_uid := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change,
      email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', admin_uid, 'authenticated', 'authenticated',
      admin_email, crypt('admin123', gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Administrador"}'::jsonb,
      now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), admin_uid, jsonb_build_object('sub', admin_uid::text, 'email', admin_email), 'email', admin_uid::text, now(), now(), now());
  ELSE
    UPDATE auth.users SET encrypted_password = crypt('admin123', gen_salt('bf')), email_confirmed_at = COALESCE(email_confirmed_at, now()) WHERE id = admin_uid;
  END IF;

  INSERT INTO public.profiles (user_id, email, full_name) VALUES (admin_uid, admin_email, 'Administrador') ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (admin_uid, 'admin') ON CONFLICT DO NOTHING;
END $$;
