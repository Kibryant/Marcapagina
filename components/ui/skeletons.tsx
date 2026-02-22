import { Skeleton } from "@/components/ui/skeleton";
import { AppShell } from "@/components/app-shell";

export function StatTileSkeleton() {
  return (
    <div className="rounded-2xl border bg-surface p-4 space-y-2 shadow-sm">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-3 w-12" />
    </div>
  );
}

export function BookCardSkeleton() {
  return (
    <div className="flex gap-4 p-4 rounded-xl border bg-surface transition-shadow shadow-sm">
      {/* Cover Skeleton */}
      <Skeleton className="h-24 w-16 shrink-0 rounded-md" />

      <div className="flex flex-col flex-1 pb-1">
        <Skeleton className="h-5 w-3/4 mb-1" />
        <Skeleton className="h-4 w-1/2 mb-auto" />

        {/* Progress Skeleton */}
        <div className="space-y-1.5 mt-3">
          <Skeleton className="h-1.5 w-full rounded-full" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-8" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardLoadingSkeleton() {
  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header/Greeting */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>

          <div className="flex flex-col items-end gap-1">
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
          {/* Main Column */}
          <div className="space-y-8">
            {/* Daily Goal Skeleton */}
            <div className="rounded-2xl border p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm border-primary/20 bg-primary/2">
              <div className="relative h-32 w-32 shrink-0 flex items-center justify-center">
                <Skeleton className="h-full w-full rounded-full" />
              </div>
              <div className="text-center md:text-left space-y-4 flex-1 w-full">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <Skeleton className="h-10 w-full md:w-48 rounded-xl" />
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatTileSkeleton />
              <StatTileSkeleton />
              <StatTileSkeleton />
              <StatTileSkeleton />
            </div>

            {/* CTA */}
            <Skeleton className="h-14 lg:h-12 w-full rounded-xl" />

            {/* Active Books */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <BookCardSkeleton />
                <BookCardSkeleton />
              </div>
            </section>
          </div>

          {/* Right Column */}
          <aside className="space-y-8">
            <section className="space-y-4">
              <Skeleton className="h-5 w-48" />
              <div className="space-y-3">
                <Skeleton className="h-28 w-full rounded-2xl" />
                <Skeleton className="h-28 w-full rounded-2xl" />
              </div>
            </section>

            <section className="space-y-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-64 w-full rounded-2xl" />
            </section>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

export function SettingsLoadingSkeleton() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>

        <div className="space-y-6">
          <Skeleton className="h-96 w-full rounded-xl" />
          <Skeleton className="h-72 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>
    </AppShell>
  );
}

export function LogReadingLoadingSkeleton() {
  return (
    <AppShell>
      <div className="space-y-6">
        <Skeleton className="h-4 w-20" />

        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>

            <div className="border-y py-6 border-dashed space-y-6 flex flex-col items-center">
              <Skeleton className="h-4 w-32" />
              <div className="flex items-center justify-center gap-6 w-full px-8">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-16 w-24" />
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>

            <Skeleton className="h-14 w-full rounded-xl mt-4" />
          </div>
        </div>
      </div>
    </AppShell>
  )
}

export function BookDetailsLoadingSkeleton() {
  return (
    <AppShell>
      <div className="space-y-8">
        <Skeleton className="h-4 w-24" />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
          <div className="space-y-8">
            <section className="space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-9 w-64" />
                  <Skeleton className="h-6 w-48" />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-8 w-32" />
                </div>
              </div>

              <div className="space-y-3 pt-6 p-6 rounded-2xl border bg-surface shadow-sm">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-6 w-full rounded-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <Skeleton className="h-7 w-48" />
              <div className="space-y-3">
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
              </div>
            </section>
          </div>

          <aside className="space-y-8">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-5 w-8 rounded-full" />
              </div>

              <Skeleton className="h-48 w-full rounded-2xl" />

              <div className="space-y-4">
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
              </div>
            </section>
          </aside>
        </div>
      </div>
    </AppShell>
  )
}
