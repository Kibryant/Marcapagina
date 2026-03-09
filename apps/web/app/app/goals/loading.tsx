import { AppShell } from "@/components/app-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-64 mb-1" />
          <Skeleton className="h-4 w-96 mt-1" />
        </div>

        <div className="space-y-8">
          <section className="space-y-4">
            <Skeleton className="h-4 w-32" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          </section>

          <section className="space-y-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-36 w-full rounded-xl" />
          </section>

          <section className="space-y-4 pt-4 border-t border-border">
            <Skeleton className="h-4 w-36" />
            <div className="p-6 rounded-xl border bg-card">
              <div className="space-y-4 max-w-sm">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
