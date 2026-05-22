import type { Profile } from '@marcapagina/shared';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Perfil público (perfil + livro favorito embutido) para a rota /u/[username]. */
export type PublicProfile = Profile & {
  favorite_book: { title: string; author: string | null } | null;
};

/** Perfil do usuário pelo id, ou null. */
export async function getProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return (data as Profile) ?? null;
}

/** Perfil público pelo username, com o livro favorito embutido. */
export async function getPublicProfile(
  supabase: SupabaseClient,
  username: string
): Promise<PublicProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, favorite_book:books(title, author)')
    .eq('username', username)
    .maybeSingle();
  if (error) throw error;
  return (data as PublicProfile) ?? null;
}

export async function updateProfile(
  supabase: SupabaseClient,
  userId: string,
  patch: Partial<Profile>
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', userId);
  if (error) throw error;
}

/** Conexões (follows) onde o usuário é seguidor ou seguido — usado no export. */
export async function listFollowsForUser(
  supabase: SupabaseClient,
  userId: string
): Promise<unknown[]> {
  const { data, error } = await supabase
    .from('follows')
    .select('*')
    .or(`follower_id.eq.${userId},following_id.eq.${userId}`);
  if (error) throw error;
  return data ?? [];
}
