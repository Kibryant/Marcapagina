"use client";

import { useMemo } from "react";
import {
  format,
  subDays,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  eachWeekOfInterval,
  isSameMonth
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn, ReadingSession } from "@marcapagina/shared";

interface ReadingHeatmapProps {
  sessions: ReadingSession[];
  days?: number;
}

export function ReadingHeatmap({ sessions, days = 180 }: ReadingHeatmapProps) {
  const heatmapData = useMemo(() => {
    const today = new Date();
    const startDate = subDays(today, days);

    // 1. Map sessions to dates
    const sessionMap = new Map<string, number>();
    sessions.forEach(s => {
      const dateStr = s.date;
      sessionMap.set(dateStr, (sessionMap.get(dateStr) || 0) + s.pages_read);
    });

    // 3. Create grid data (weeks)
    const weeks = eachWeekOfInterval({
      start: startOfWeek(startDate),
      end: endOfWeek(today),
    });

    return weeks.map(weekStart => {
      const weekDays = eachDayOfInterval({
        start: weekStart,
        end: endOfWeek(weekStart),
      });

      return weekDays.map(day => {
        const dateStr = format(day, "yyyy-MM-dd");
        const count = sessionMap.get(dateStr) || 0;
        const isCurrentMonth = isSameMonth(day, today);
        const dayInInterval = day >= startDate && day <= today;

        return {
          day,
          count,
          dateStr,
          isCurrentMonth,
          dayInInterval
        };
      });
    });
  }, [sessions, days]);

  const getColorClass = (count: number) => {
    if (count === 0) return "bg-muted/30";
    if (count < 10) return "bg-primary/20";
    if (count < 25) return "bg-primary/40";
    if (count < 50) return "bg-primary/70";
    return "bg-primary";
  };

  const weekLabels = ["Dom", "", "Ter", "", "Qui", "", "Sáb"];

  // Calculate month labels positions
  const monthLabels = useMemo(() => {
    const labels: { name: string; index: number }[] = [];
    let lastMonth = -1;

    heatmapData.forEach((week, index) => {
      const firstDayOfWeek = week[0].day;
      const month = firstDayOfWeek.getMonth();
      if (month !== lastMonth) {
        labels.push({
          name: format(firstDayOfWeek, "MMM", { locale: ptBR }),
          index
        });
        lastMonth = month;
      }
    });
    return labels;
  }, [heatmapData]);

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Consistência de Leitura</h3>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
          <span>Menos</span>
          <div className="flex gap-1">
            <div className="w-2.5 h-2.5 rounded-sm bg-muted/30" />
            <div className="w-2.5 h-2.5 rounded-sm bg-primary/20" />
            <div className="w-2.5 h-2.5 rounded-sm bg-primary/40" />
            <div className="w-2.5 h-2.5 rounded-sm bg-primary/70" />
            <div className="w-2.5 h-2.5 rounded-sm bg-primary" />
          </div>
          <span>Mais</span>
        </div>
      </div>

      <div className="bg-surface border rounded-2xl p-6 shadow-sm overflow-x-auto scrollbar-hide">
        <div className="min-w-max">
          {/* Months Header */}
          <div className="flex mb-2 h-4 relative">
            <div className="w-8 shrink-0" /> {/* Spacer for week labels */}
            {monthLabels.map((label, i) => (
              <div
                key={i}
                className="absolute text-[10px] font-bold text-muted-foreground uppercase tracking-tighter"
                style={{ left: `${label.index * 14}px` }}
              >
                {label.name}
              </div>
            ))}
          </div>

          <div className="flex gap-1.5">
            {/* Week Labels */}
            <div className="flex flex-col gap-1 justify-between py-0.5">
              {weekLabels.map((label, i) => (
                <div key={i} className="h-2.5 w-8 text-[9px] font-medium text-muted-foreground leading-none flex items-center">
                  {label}
                </div>
              ))}
            </div>

            {/* Heatmap Grid */}
            <div className="flex gap-1">
              {heatmapData.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((dayData, dayIndex) => (
                    <div
                      key={dayIndex}
                      title={`${dayData.count} páginas em ${format(dayData.day, "dd/MM/yyyy")}`}
                      className={cn(
                        "w-2.5 h-2.5 rounded-sm transition-all duration-300 hover:ring-2 hover:ring-primary/40 hover:scale-125 cursor-pointer z-10",
                        dayData.dayInInterval ? getColorClass(dayData.count) : "opacity-0 pointer-events-none"
                      )}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
