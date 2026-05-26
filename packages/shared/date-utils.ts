import { format } from 'date-fns';

export interface DateOptions {
  /** Instante de referência. Default: `new Date()`. */
  now?: Date;
  /**
   * IANA timezone (ex.: 'America/Sao_Paulo'). Sem isso, o cálculo usa a TZ
   * do ambiente — TZ do browser no client, do processo Node no server.
   *
   * Para os apps web/mobile do Marcapágina, passar `profile.timezone` garante
   * que "hoje" seja consistente entre browser, servidor Vercel (UTC) e
   * Postgres do Supabase (UTC).
   */
  timezone?: string;
}

/**
 * Formata a data corrente como `YYYY-MM-DD` na timezone informada.
 *
 * Usa `Intl.DateTimeFormat` ao invés de `date-fns-tz` pra evitar uma
 * dependência adicional — a API nativa cobre o caso de uso.
 */
export function getTodayDateString(opts?: DateOptions): string {
  const now = opts?.now ?? new Date();
  if (opts?.timezone) {
    return formatInTimezone(now, opts.timezone);
  }
  return format(now, 'yyyy-MM-dd');
}

/** Formata uma data específica como `YYYY-MM-DD` na timezone informada. */
export function formatInTimezone(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}
