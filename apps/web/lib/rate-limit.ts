// Rate limiter in-memory por chave.
//
// Funciona em serverless porque cada instância mantém seu próprio Map. O
// efeito prático no Vercel: cada região/instância tem seu próprio "balde",
// então o limite real é (limit × n_instâncias). Bom o suficiente pra cortar
// abuso óbvio em endpoint barato como /api/books/search.
//
// Quando o app crescer (ou se quisermos limites mais finos), trocar a
// implementação por Upstash Redis + @upstash/ratelimit — a interface deste
// módulo já está pronta pra esse swap.

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Cleanup periódico defensivo pra evitar Map crescer sem fim em instâncias
// long-lived (não-serverless / dev). Roda no máximo 1×/min.
let lastCleanup = 0;
function maybeCleanup(now: number) {
  if (now - lastCleanup < 60_000) return;
  lastCleanup = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}

export interface RateLimitOptions {
  /** Chave única do bucket (ex: `${endpoint}:${ip}`). */
  key: string;
  /** Máximo de requests dentro da janela. */
  limit: number;
  /** Janela em milissegundos. */
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  /** Quantas requests ainda cabem na janela atual. */
  remaining: number;
  /** Epoch ms quando a janela atual reseta. */
  resetAt: number;
  /** Segundos até o reset — útil pro header Retry-After. */
  retryAfterSeconds: number;
}

export function checkRateLimit(opts: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  maybeCleanup(now);

  const existing = buckets.get(opts.key);
  if (!existing || existing.resetAt < now) {
    const resetAt = now + opts.windowMs;
    buckets.set(opts.key, { count: 1, resetAt });
    return {
      success: true,
      remaining: opts.limit - 1,
      resetAt,
      retryAfterSeconds: 0,
    };
  }

  existing.count += 1;
  const remaining = Math.max(0, opts.limit - existing.count);
  const retryAfterSeconds = Math.max(
    0,
    Math.ceil((existing.resetAt - now) / 1000)
  );

  return {
    success: existing.count <= opts.limit,
    remaining,
    resetAt: existing.resetAt,
    retryAfterSeconds,
  };
}

/**
 * Extrai o IP do cliente confiando no header `x-forwarded-for` da Vercel.
 * `unknown` é o fallback que ainda é "rate-limitável" — todos os requests
 * sem IP compartilham o mesmo balde, o que é seguro contra abuso anônimo.
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}
