'use client';

import type { ReadingSession } from '@marcapagina/shared';
import {
  eachWeekOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isWithinInterval,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart3, Clock, TrendingUp } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface ReadingChartsProps {
  sessions: ReadingSession[];
}

interface WeeklyData {
  week: string;
  pages: number;
}

interface MonthlyData {
  month: string;
  pages: number;
}

interface WeeklyDurationData {
  week: string;
  minutes: number;
}

function CustomTooltip({
  active,
  payload,
  label,
  suffix,
  isDark,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  suffix: string;
  isDark?: boolean;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className={`${isDark ? 'bg-[#1a1c1e] border-white/10' : 'bg-white border-gray-200'} border rounded-xl px-4 py-2.5 shadow-xl`}>
      <p className={`text-[10px] ${isDark ? 'text-white/50' : 'text-gray-400'} font-bold uppercase tracking-widest mb-0.5`}>
        {label}
      </p>
      <p className={`text-sm font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {payload[0].value.toLocaleString('pt-BR')} {suffix}
      </p>
    </div>
  );
}

export function ReadingCharts({ sessions }: ReadingChartsProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const colors = {
    primary: '#6366f1',
    success: '#22c55e',
    grid: isDark ? '#1e293b' : '#e2e8f0',
    tick: isDark ? '#94a3b8' : '#64748b',
    cursor: isDark ? 'rgba(30,41,59,0.3)' : 'rgba(226,232,240,0.5)',
    dotStroke: isDark ? '#0a0a0a' : '#ffffff',
  };

  // === Weekly Pages Data (last 12 weeks) ===
  const weeklyPagesData = useMemo<WeeklyData[]>(() => {
    const today = new Date();
    const weeks = eachWeekOfInterval({
      start: startOfWeek(subWeeks(today, 11)),
      end: endOfWeek(today),
    });

    return weeks.map((weekStart) => {
      const weekEnd = endOfWeek(weekStart);
      const pagesInWeek = sessions
        .filter((s) => {
          const d = new Date(`${s.date}T12:00:00`);
          return isWithinInterval(d, { start: weekStart, end: weekEnd });
        })
        .reduce((sum, s) => sum + s.pages_read, 0);

      return {
        week: format(weekStart, "dd 'de' MMM", { locale: ptBR }),
        pages: pagesInWeek,
      };
    });
  }, [sessions]);

  // === Monthly Trend Data (last 6 months) ===
  const monthlyTrendData = useMemo<MonthlyData[]>(() => {
    const today = new Date();
    const months: MonthlyData[] = [];

    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(today, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const pagesInMonth = sessions
        .filter((s) => {
          const d = new Date(`${s.date}T12:00:00`);
          return isWithinInterval(d, { start: monthStart, end: monthEnd });
        })
        .reduce((sum, s) => sum + s.pages_read, 0);

      months.push({
        month: format(monthDate, 'MMM', { locale: ptBR }),
        pages: pagesInMonth,
      });
    }

    return months;
  }, [sessions]);

  // === Weekly Duration Data (last 12 weeks) ===
  const weeklyDurationData = useMemo<WeeklyDurationData[]>(() => {
    const today = new Date();
    const weeks = eachWeekOfInterval({
      start: startOfWeek(subWeeks(today, 11)),
      end: endOfWeek(today),
    });

    return weeks.map((weekStart) => {
      const weekEnd = endOfWeek(weekStart);
      const minutesInWeek = sessions
        .filter((s) => {
          const d = new Date(`${s.date}T12:00:00`);
          return isWithinInterval(d, { start: weekStart, end: weekEnd });
        })
        .reduce((sum, s) => sum + (s.duration_minutes || 0), 0);

      return {
        week: format(weekStart, "dd 'de' MMM", { locale: ptBR }),
        minutes: minutesInWeek,
      };
    });
  }, [sessions]);

  const chartSections = [
    {
      title: 'Páginas por Semana',
      icon: <BarChart3 className="h-4 w-4" />,
      description: 'Últimas 12 semanas de leitura',
      chart: (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={weeklyPagesData} barSize={20}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.4} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={colors.grid}
              strokeOpacity={0.5}
            />

            <XAxis
              dataKey="week"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: colors.tick }}
              interval="preserveStartEnd"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: colors.tick }}
              width={35}
            />
            <Tooltip
              content={<CustomTooltip suffix="páginas" isDark={isDark} />}
              cursor={{ fill: colors.cursor }}
            />
            <Bar
              dataKey="pages"
              fill="url(#barGradient)"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: 'Evolução Mensal',
      icon: <TrendingUp className="h-4 w-4" />,
      description: 'Tendência dos últimos 6 meses',
      chart: (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={monthlyTrendData}>
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={colors.grid}
              strokeOpacity={0.5}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 11,
                fill: colors.tick,
                fontWeight: 600,
              }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: colors.tick }}
              width={35}
            />
            <Tooltip content={<CustomTooltip suffix="páginas" isDark={isDark} />} />
            <Area
              type="monotone"
              dataKey="pages"
              stroke="#6366f1"
              strokeWidth={2.5}
              fill="url(#areaGradient)"
              dot={{
                r: 4,
                fill: '#6366f1',
                stroke: colors.dotStroke,
                strokeWidth: 2,
              }}
              activeDot={{
                r: 6,
                fill: '#6366f1',
                stroke: colors.dotStroke,
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: 'Tempo de Leitura',
      icon: <Clock className="h-4 w-4" />,
      description: 'Minutos lidos por semana',
      chart: (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={weeklyDurationData} barSize={20}>
            <defs>
              <linearGradient id="durationGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="hsl(142 71% 45%)"
                  stopOpacity={1}
                />
                <stop
                  offset="100%"
                  stopColor="hsl(142 71% 45%)"
                  stopOpacity={0.3}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={colors.grid}
              strokeOpacity={0.5}
            />
            <XAxis
              dataKey="week"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: colors.tick }}
              interval="preserveStartEnd"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: colors.tick }}
              width={35}
            />
            <Tooltip
              content={<CustomTooltip suffix="min" isDark={isDark} />}
              cursor={{ fill: colors.cursor }}
            />
            <Bar
              dataKey="minutes"
              fill="url(#durationGradient)"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold tracking-tight">Estatísticas</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {chartSections.map((section) => (
          <div
            key={section.title}
            className="bg-surface border rounded-2xl p-6 shadow-sm space-y-4 first:lg:col-span-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  {section.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold">{section.title}</h3>
                  <p className="text-[10px] text-muted-foreground font-medium">
                    {section.description}
                  </p>
                </div>
              </div>
            </div>
            {section.chart}
          </div>
        ))}
      </div>
    </div>
  );
}
