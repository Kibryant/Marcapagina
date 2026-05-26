import type { BookEta } from '@marcapagina/shared';
import { Clock } from 'lucide-react';

interface BookEtaCardProps {
  eta: BookEta;
}

export function BookEtaCard({ eta }: BookEtaCardProps) {
  if (eta.pagesRemaining === 0) return null;

  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl border bg-surface shadow-sm">
      <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
        <Clock className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Previsão para terminar
        </p>
        {eta.daysRemaining === null ? (
          <p className="text-sm font-semibold text-foreground mt-0.5">
            Registre algumas leituras pra estimarmos.
          </p>
        ) : eta.daysRemaining === 0 ? (
          <p className="text-sm font-semibold text-foreground mt-0.5">
            Você termina hoje no seu ritmo.
          </p>
        ) : (
          <p className="text-sm font-semibold text-foreground mt-0.5">
            ~{eta.daysRemaining} {eta.daysRemaining === 1 ? 'dia' : 'dias'}{' '}
            <span className="font-medium text-muted-foreground">
              a {eta.pacePerDay} pág/dia
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
