"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { format, startOfMonth, eachDayOfInterval, endOfMonth, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ReadingSession {
  date: string;
  pages_read: number;
}

interface MonthlyChartProps {
  sessions: ReadingSession[];
}

export function MonthlyChart({ sessions }: MonthlyChartProps) {
  const chartData = useMemo(() => {
    const today = new Date();
    const start = startOfMonth(today);
    const end = endOfMonth(today);
    const days = eachDayOfInterval({ start, end });

    return days.map((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      const daySessions = sessions.filter((s) => s.date === dateStr);
      const pages = daySessions.reduce((acc, s) => acc + s.pages_read, 0);

      return {
        date: dateStr,
        day: format(day, "d"),
        pages,
        isToday: isSameDay(day, today),
      };
    });
  }, [sessions]);

  return (
    <div className="h-[200px] w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barGap={0}>
          <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border)" opacity={0.4} />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fontWeight: 500 }}
            interval={2}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fontWeight: 500 }}
            width={30}
          />
          <Tooltip
            cursor={{ fill: "var(--primary)", opacity: 0.05 }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-xl border bg-surface/90 backdrop-blur-sm p-3 shadow-xl ring-1 ring-black/5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                      {format(new Date(payload[0].payload.date + "T12:00:00"), "dd 'de' MMMM", { locale: ptBR })}
                    </p>
                    <p className="text-sm font-black text-primary flex items-center gap-1">
                      <span className="text-lg">{payload[0].value}</span>
                      <span className="text-[10px] font-medium opacity-70">páginas</span>
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="pages"
            radius={[6, 6, 0, 0]}
            barSize={12}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill="var(--primary)"
                fillOpacity={entry.isToday ? 1 : 0.3}
                className="transition-all duration-300 hover:fill-opacity-80"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
