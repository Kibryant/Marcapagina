import { AppShell } from '@/components/app-shell';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-48 mb-1" />
          <Skeleton className="h-4 w-80 mt-1" />
        </div>

        <Skeleton className="h-24 w-full rounded-2xl" />

        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <Skeleton key={n} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
