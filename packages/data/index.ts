// @marcapagina/data — camada de acesso a dados compartilhada (web + mobile).
//
// Cada função recebe um SupabaseClient por injeção e retorna tipos de domínio
// de @marcapagina/shared. Este pacote NÃO importa next/* nem @supabase/ssr —
// mantém-se agnóstico de framework para rodar nos dois apps.
//
// Regra: a UI nunca chama supabase.from(...) direto — usa estes repositórios.

export * from './src/achievements';
export * from './src/books';
export * from './src/goals';
export * from './src/highlights';
export * from './src/profiles';
export * from './src/sessions';
