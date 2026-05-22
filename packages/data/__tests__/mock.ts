import type { SupabaseClient } from '@supabase/supabase-js';

// Mock mínimo do SupabaseClient para testar os repositórios sem banco.
// O query builder é encadeável (todo método retorna o próprio builder) e
// "awaitable" (tem .then), resolvendo para um { data, error } configurável.

export type RecordedCall = { method: string; args: unknown[] };

export type QueryResult = { data: unknown; error: unknown };

type MockBuilder = {
  select: (...args: unknown[]) => MockBuilder;
  eq: (...args: unknown[]) => MockBuilder;
  neq: (...args: unknown[]) => MockBuilder;
  order: (...args: unknown[]) => MockBuilder;
  or: (...args: unknown[]) => MockBuilder;
  insert: (...args: unknown[]) => MockBuilder;
  update: (...args: unknown[]) => MockBuilder;
  delete: (...args: unknown[]) => MockBuilder;
  maybeSingle: () => Promise<QueryResult>;
  single: () => Promise<QueryResult>;
  then: (onfulfilled: (value: QueryResult) => unknown) => Promise<unknown>;
};

export function createMockSupabase(result: Partial<QueryResult> = {}) {
  const calls: RecordedCall[] = [];
  const settled: QueryResult = {
    data: result.data ?? null,
    error: result.error ?? null,
  };

  const record = (method: string, args: unknown[]) => {
    calls.push({ method, args });
  };

  const builder: MockBuilder = {
    select: (...args) => {
      record('select', args);
      return builder;
    },
    eq: (...args) => {
      record('eq', args);
      return builder;
    },
    neq: (...args) => {
      record('neq', args);
      return builder;
    },
    order: (...args) => {
      record('order', args);
      return builder;
    },
    or: (...args) => {
      record('or', args);
      return builder;
    },
    insert: (...args) => {
      record('insert', args);
      return builder;
    },
    update: (...args) => {
      record('update', args);
      return builder;
    },
    delete: (...args) => {
      record('delete', args);
      return builder;
    },
    maybeSingle: () => {
      record('maybeSingle', []);
      return Promise.resolve(settled);
    },
    single: () => {
      record('single', []);
      return Promise.resolve(settled);
    },
    // biome-ignore lint/suspicious/noThenProperty: o query builder do Supabase é awaitable; o mock precisa imitar isso.
    then: (onfulfilled) => Promise.resolve(settled).then(onfulfilled),
  };

  const client = {
    from: (table: string) => {
      record('from', [table]);
      return builder;
    },
    rpc: (fn: string, params: unknown) => {
      record('rpc', [fn, params]);
      return Promise.resolve(settled);
    },
  };

  return {
    supabase: client as unknown as SupabaseClient,
    calls,
  };
}
