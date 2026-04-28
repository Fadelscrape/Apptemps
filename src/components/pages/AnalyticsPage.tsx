'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  Calendar,
  Flame,
  Award,
  CheckCircle2,
  Clock,
  Zap,
} from 'lucide-react';
import type { HeatmapData, WeeklyData, PriorityData } from '@/types';

const COLORS = ['#ef4444', '#f97316', '#3b82f6', '#6b7280'];

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const [summary, setSummary] = useState<any>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [priorityData, setPriorityData] = useState<PriorityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const [summaryRes, heatmapRes, weeklyRes, priorityRes] = await Promise.all([
        fetch('/api/analytics?type=summary'),
        fetch('/api/analytics?type=heatmap'),
        fetch('/api/analytics?type=weekly'),
        fetch('/api/analytics?type=priorities'),
      ]);

      const summaryJson = await summaryRes.json();
      const heatmapJson = await heatmapRes.json();
      const weeklyJson = await weeklyRes.json();
      const priorityJson = await priorityRes.json();

      if (summaryJson.success) setSummary(summaryJson.data);
      if (heatmapJson.success) setHeatmapData(heatmapJson.data);
      if (weeklyJson.success) setWeeklyData(weeklyJson.data);
      if (priorityJson.success) setPriorityData(priorityJson.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    color,
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: any;
    color: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${color.replace('text-', 'bg-').replace('600', '100').replace('400', '100').replace('-600', '-100')}`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
        </div>
      </Card>
    </motion.div>
  );

  const Heatmap = () => {
    const today = new Date();
    const year = today.getFullYear();
    const weeks = Math.ceil(today.getDate() / 7);

    // Generate heatmap grid for last 52 weeks
    const grid: (number | null)[][] = [];

    for (let week = 0; week < 52; week++) {
      const weekRow: (number | null)[] = [];
      for (let day = 0; day < 7; day++) {
        weekRow.push(0);
      }
      grid.push(weekRow);
    }

    // Fill in data from heatmapData
    heatmapData.forEach((item) => {
      const date = new Date(item.date);
      const daysSinceStart = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceStart < 364) {
        const week = Math.floor(daysSinceStart / 7);
        const day = date.getDay() === 0 ? 6 : date.getDay() - 1;
        if (week >= 0 && week < 52 && day >= 0 && day < 7) {
          grid[week][day] = item.count;
        }
      }
    });

    const getHeatmapColor = (count: number) => {
      if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
      if (count <= 2) return 'bg-green-200 dark:bg-green-900';
      if (count <= 4) return 'bg-green-400 dark:bg-green-700';
      if (count <= 6) return 'bg-green-600 dark:bg-green-500';
      return 'bg-green-800 dark:bg-green-400';
    };

    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Activité annuelle
          </h3>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span>Moins</span>
            <div className="flex gap-1 ml-2">
              {[0, 2, 4, 6, 8].map((level, i) => (
                <div key={i} className={`w-3 h-3 rounded-sm ${getHeatmapColor(level)}`} />
              ))}
            </div>
            <span>Plus</span>
          </div>
        </div>

        <ScrollArea className="w-full">
          <div className="flex gap-1 min-w-max pb-4">
            {grid.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((count, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={`w-3 h-3 rounded-sm ${getHeatmapColor(count)}`}
                    title={`${count} tâche${count > 1 ? 's' : ''}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Chargement des analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Analysez votre productivité et vos progrès
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Niveau"
            value={`Niveau ${user?.level}`}
            subtitle={`${user?.xp} XP`}
            icon={Award}
            color="text-purple-600"
          />
          <StatCard
            title="Streak actuel"
            value={summary?.streakCurrent || 0}
            subtitle="Jours consécutifs"
            icon={Flame}
            color="text-orange-600"
          />
          <StatCard
            title="Aujourd'hui"
            value={`${summary?.todayCompleted || 0}/${summary?.todayTotal || 0}`}
            subtitle="Tâches complétées"
            icon={CheckCircle2}
            color="text-blue-600"
          />
          <StatCard
            title="Cette semaine"
            value={summary?.weekCompleted || 0}
            subtitle="Tâches complétées"
            icon={Calendar}
            color="text-green-600"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Weekly Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              7 derniers jours
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('fr-FR', { weekday: 'short' });
                  }}
                  className="text-gray-600 dark:text-gray-400"
                />
                <YAxis className="text-gray-600 dark:text-gray-400" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    });
                  }}
                />
                <Bar dataKey="completed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Priorities Pie Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              Répartition par priorité
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Heatmap */}
        <Heatmap />

        {/* Insights */}
        <Card className="p-6 mt-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Zap className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Performance du jour</h3>
              <p className="text-purple-100">
                {summary && summary.todayCompleted > 0 ? (
                  <>
                    Excellent ! Vous avez complété {summary.todayCompleted} tâche
                    {summary.todayCompleted > 1 ? 's' : ''} aujourd'hui. Continuez comme ça !
                  </>
                ) : (
                  <>
                    Commencez par une petite tâche pour lancer votre streak. Chaque victoire compte !
                  </>
                )}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
