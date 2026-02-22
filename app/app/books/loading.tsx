import { AppShell } from "@/components/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { BookCardSkeleton } from "@/components/ui/skeletons";

export default function Loading() {
  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>

        {/* Chips Skeleton */}
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-32 rounded-full" />
        </div>

        {/* Books Sections Skeleton */}
        <div className="space-y-10">
          <section className="space-y-4">
            <Skeleton className="h-10 w-full rounded-xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BookCardSkeleton />
              <BookCardSkeleton />
            </div>
          </section>

          <section className="space-y-4">
            <Skeleton className="h-10 w-full rounded-xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BookCardSkeleton />
              <BookCardSkeleton />
              <BookCardSkeleton />
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
