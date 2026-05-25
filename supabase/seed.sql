-- supabase/seed.sql — dados de teste para E2E.
-- Aplicado automaticamente pelo `supabase db reset`.
--
-- O gatilho handle_new_user em auth.users não veio no dump (`supabase db dump`
-- exporta só o schema public), então o profile é criado explicitamente aqui.

-- ── Usuário de teste ────────────────────────────────────────────────────────
-- E-mail: e2e@marcapagina.test  ·  Senha: e2e-password-123
-- As colunas de token (confirmation_token etc.) precisam ser '' e não NULL —
-- o GoTrue as lê como string e quebra em NULL.
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  email_change_token_current,
  phone_change,
  phone_change_token,
  reauthentication_token
) values (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated',
  'authenticated',
  'e2e@marcapagina.test',
  extensions.crypt('e2e-password-123', extensions.gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"display_name":"Leitor E2E"}',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  ''
);

-- Identidade de e-mail (o GoTrue exige para login com senha).
insert into auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  created_at,
  updated_at,
  last_sign_in_at
) values (
  gen_random_uuid(),
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  '{"sub":"11111111-1111-1111-1111-111111111111","email":"e2e@marcapagina.test","email_verified":true}',
  'email',
  now(),
  now(),
  now()
);

-- ── Profile ─────────────────────────────────────────────────────────────────
insert into public.profiles (id, display_name, username, goal_pages_per_day)
values (
  '11111111-1111-1111-1111-111111111111',
  'Leitor E2E',
  'e2e_user',
  20
)
on conflict (id) do nothing;

-- ── Livro de exemplo (em leitura) ───────────────────────────────────────────
insert into public.books (
  id,
  user_id,
  title,
  author,
  total_pages,
  current_page,
  status
) values (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'O Livro de Teste',
  'Autora Exemplo',
  200,
  40,
  'reading'
);

-- ── Conquistas de exemplo ───────────────────────────────────────────────────
-- Valores propositalmente altos para que os specs E2E não as desbloqueiem
-- acidentalmente ao registrar uma leitura.
insert into public.achievements (id, name, description, icon, criteria_type, criteria_value, xp_reward)
values
  (
    '33333333-3333-3333-3333-333333333333',
    'Maratonista E2E',
    'Leia 999 páginas em um único dia.',
    'Flame',
    'pages_day',
    999,
    100
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'Colecionador E2E',
    'Adicione 999 livros à sua biblioteca.',
    'Library',
    'books_added',
    999,
    100
  );
