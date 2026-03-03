"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StoryCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  highlight?: boolean;
}

export function StoryCard({ title, value, description, icon, trend, trendValue, highlight }: StoryCardProps) {
  return (
    <div className={cn(
      "group relative overflow-hidden rounded-2xl border p-6 transition-all hover:shadow-md",
      highlight ? "bg-primary/5 border-primary/20" : "bg-surface border-border"
    )}>
      <div className="flex items-start justify-between md:flex-col md:gap-4 lg:flex-row lg:items-center">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg",
              highlight ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              {icon}
            </div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{title}</h3>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black md:text-3xl">{value}</span>
              {trend && trendValue && (
                <span className={cn(
                  "text-xs font-bold px-2 py-0.5 rounded-full",
                  trend === "up" ? "bg-success/10 text-success" :
                    trend === "down" ? "bg-destructive/10 text-destructive" :
                      "bg-muted text-muted-foreground"
                )}>
                  {trendValue}
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
