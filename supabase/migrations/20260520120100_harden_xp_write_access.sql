-- Hardening: impede o cliente de gravar XP/nível/conquistas diretamente.
--
-- A RPC log_reading_session (SECURITY DEFINER) passa a ser o único caminho
-- legítimo para alterar profiles.xp, profiles.level e user_achievements.
-- Sem isto, um request forjado ainda conseguiria dar UPDATE em profiles.xp.
--
-- REVISE ANTES DE APLICAR: confirme a lista de colunas de `profiles` com
-- `\d public.profiles` (ou no dashboard). A lista abaixo reflete a interface
-- Profile em packages/shared/index.ts. Se houver colunas extras editáveis
-- pelo usuário, inclua-as no GRANT.

-- profiles: tira o UPDATE de tabela inteira e devolve só as colunas que o
-- usuário pode editar pela UI (settings, foto de perfil). xp/level ficam de
-- fora — só a RPC (que roda como owner) consegue alterá-las.
revoke update on public.profiles from authenticated;
grant update (
  display_name,
  username,
  avatar_url,
  favorite_book_id,
  locale,
  timezone,
  theme,
  week_starts_on,
  goal_pages_per_day,
  is_public,
  social_settings
) on public.profiles to authenticated;

-- user_achievements: só leitura para o cliente. A concessão de conquistas
-- acontece exclusivamente dentro da RPC.
revoke insert, update, delete on public.user_achievements from authenticated;
