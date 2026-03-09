import { Card, CardContent } from "@/components/ui/card";

interface StatTileProps {
  label: string;
  value: string | number;
  subtext?: string;
}

export function StatTile({ label, value, subtext }: StatTileProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 flex flex-col items-center justify-center text-center">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
          {label}
        </span>
        <span className="text-3xl font-bold tracking-tight text-foreground">
          {value}
        </span>
        {subtext && (
          <span className="text-xs text-muted-foreground mt-1">
            {subtext}
          </span>
        )}
      </CardContent>
    </Card>
  );
}
