'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useTaskStore } from '@/store/taskStore';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Home,
  Kanban,
  Calendar,
  BarChart3,
  Clock,
  Settings,
  LogOut,
  Plus,
  CheckCircle2,
  Flame,
  Star,
  LayoutDashboard,
  Moon,
  Zap,
  Trash2,
  FolderOpen,
} from 'lucide-react';
import { XP_LEVELS } from '@/types';
import KanbanPage from './KanbanPage';
import CalendarPage from './CalendarPage';
import AnalyticsPage from './AnalyticsPage';
import FocusPage from './FocusPage';
import SettingsPage from './SettingsPage';
import ProjectsPage from './ProjectsPage';
import TaskModal from '@/components/TaskModal';

type ViewType = 'dashboard' | 'kanban' | 'calendar' | 'analytics' | 'focus' | 'projects' | 'settings';

const VIEW_CONFIG: Record<
  ViewType,
  { icon: any; label: string; component: React.ReactNode }
> = {
  dashboard: { icon: Home, label: "Aujourd'hui", component: null },
  kanban: { icon: Kanban, label: 'Kanban', component: <KanbanPage /> },
  calendar: { icon: Calendar, label: 'Calendrier', component: <CalendarPage /> },
  analytics: { icon: BarChart3, label: 'Analytics', component: <AnalyticsPage /> },
  focus: { icon: Clock, label: 'Focus', component: <FocusPage /> },
  projects: { icon: FolderOpen, label: 'Projets', component: <ProjectsPage /> },
  settings: { icon: Settings, label: 'Paramètres', component: <SettingsPage /> },
};

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const { tasks, isLoading, fetchTodayTasks, completeTask, deleteTask } = useTaskStore();
  const { sidebarOpen, toggleSidebar, setSidebarOpen, setTaskModalOpen } = useUIStore();
  const [view, setView] = useState<ViewType>('dashboard');

  useEffect(() => {
    if (user) {
      fetchTodayTasks();
    }
  }, [user, fetchTodayTasks]);

  const handleComplete = async (taskId: string) => {
    try {
      const result = await completeTask(taskId);
      if (result) {
        toast.success(`Tâche complétée ! +${result.xpGained} XP`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur');
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      toast.success('Tâche supprimée');
    } catch (error: any) {
      toast.error(error.message || 'Erreur');
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Déconnexion réussie');
  };

  const getLevelProgress = () => {
    if (!user) return 0;
    const currentLevelIndex = Math.min(user.level - 1, XP_LEVELS.length - 1);
    const currentXP = user.xp - XP_LEVELS[currentLevelIndex];
    const nextLevelXP = XP_LEVELS[currentLevelIndex + 1] - XP_LEVELS[currentLevelIndex];
    return (currentXP / nextLevelXP) * 100;
  };

  const xpToNextLevel = () => {
    if (!user) return 0;
    const currentLevelIndex = Math.min(user.level - 1, XP_LEVELS.length - 1);
    return XP_LEVELS[currentLevelIndex + 1] - user.xp;
  };

  const getTasksByTimeOfDay = () => {
    const now = new Date();
    const todayTasks = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate).toDateString() === now.toDateString()
    );

    return {
      overdue: tasks.filter((t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done'),
      morning: todayTasks.filter((t) => !t.dueTime || (t.dueTime && parseInt(t.dueTime.split(':')[0]) < 12)),
      afternoon: todayTasks.filter(
        (t) => t.dueTime && parseInt(t.dueTime.split(':')[0]) >= 12 && parseInt(t.dueTime.split(':')[0]) < 18
      ),
      evening: todayTasks.filter((t) => t.dueTime && parseInt(t.dueTime.split(':')[0]) >= 18),
    };
  };

  const taskGroups = getTasksByTimeOfDay();

  const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
    <motion.button
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        active
          ? 'bg-purple-600 text-white'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </motion.button>
  );

  const TaskCard = ({ task }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="group"
    >
      <Card className="p-4 hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-500">
        <div className="flex items-start gap-3">
          <button
            onClick={() => handleComplete(task.id)}
            disabled={task.status === 'done'}
            className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full border-2 transition-colors ${
              task.status === 'done'
                ? 'bg-green-500 border-green-500'
                : 'border-gray-300 hover:border-purple-500 dark:border-gray-600'
            }`}
          >
            {task.status === 'done' && <CheckCircle2 className="w-5 h-5 text-white" />}
          </button>

          <div className="flex-1 min-w-0">
            <h4
              className={`font-medium mb-1 ${
                task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-900 dark:text-gray-100'
              }`}
            >
              {task.title}
            </h4>

            <div className="flex flex-wrap gap-2 mb-2">
              {task.priority && (
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    task.priority === 'urgent'
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : task.priority === 'high'
                      ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                      : task.priority === 'medium'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                  }`}
                >
                  {task.priority}
                </span>
              )}
              {task.estimatedMinutes && (
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                  {task.estimatedMinutes} min
                </span>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(task.id)}
            className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );

  // Mobile bottom navigation
  const MobileNav = () => (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 overflow-x-auto">
      <div className="flex items-center min-w-max px-1 py-2 mx-auto">
        {Object.entries(VIEW_CONFIG).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setView(key as ViewType)}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors flex-shrink-0 ${
              view === key ? 'text-purple-600' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <config.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium whitespace-nowrap">{config.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );

  // If viewing a full page component
  if (view !== 'dashboard' && VIEW_CONFIG[view]?.component) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
        <TaskModal />
        {/* Sidebar - Desktop only */}
        <aside className="hidden md:flex md:flex-col w-16 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-1 px-2">
              {Object.entries(VIEW_CONFIG).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setView(key as ViewType)}
                  className={`w-full flex items-center justify-center p-3 rounded-lg transition-colors ${
                    view === key
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  title={config.label}
                >
                  <config.icon className="w-5 h-5" />
                </button>
              ))}
            </nav>
          </ScrollArea>

          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Déconnexion"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden pb-16 md:pb-0">
          {VIEW_CONFIG[view]?.component}
        </main>

        <MobileNav />
      </div>
    );
  }

  // Dashboard view
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      <TaskModal />
      {/* Sidebar - Desktop only */}
      <aside
        className={`hidden md:flex md:flex-col ${sidebarOpen ? 'md:w-64' : 'md:w-20'} bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <span className="font-bold text-lg bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                TaskMaster
              </span>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-2">
            <SidebarItem icon={Home} label="Aujourd'hui" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
            <SidebarItem icon={Kanban} label="Kanban" active={view === 'kanban'} onClick={() => setView('kanban')} />
            <SidebarItem icon={Calendar} label="Calendrier" active={view === 'calendar'} onClick={() => setView('calendar')} />
            <SidebarItem icon={BarChart3} label="Analytics" active={view === 'analytics'} onClick={() => setView('analytics')} />
            <SidebarItem icon={Clock} label="Focus" active={view === 'focus'} onClick={() => setView('focus')} />
            <SidebarItem icon={Settings} label="Paramètres" active={view === 'settings'} onClick={() => setView('settings')} />
          </nav>
        </ScrollArea>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col pb-16 md:pb-0">
        {/* Top Bar */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="hidden md:flex" onClick={toggleSidebar}>
                <LayoutDashboard className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Bonjour, {user?.username} ! 👋
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  {new Date().toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toast.info('Mode sombre/clair à implémenter')}
              >
                <Moon className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <ScrollArea className="flex-1">
          <div className="p-4 sm:p-6 max-w-6xl mx-auto">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm mb-1">Niveau {user?.level}</p>
                    <p className="text-3xl font-bold">{user?.xp} XP</p>
                    <p className="text-purple-100 text-xs mt-2">+{xpToNextLevel()} XP pour le niveau suivant</p>
                  </div>
                  <Star className="w-10 h-10 text-purple-200" />
                </div>
                <Progress value={getLevelProgress()} className="mt-4 bg-purple-400" />
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Streak actuel</p>
                    <p className="text-3xl font-bold text-orange-600">{user?.streakCurrent}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs mt-2">
                      Meilleur: {user?.streakBest} jours
                    </p>
                  </div>
                  <Flame className="w-10 h-10 text-orange-500" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Tâches du jour</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {tasks.filter((t) => t.status === 'done').length} / {tasks.length}
                    </p>
                  </div>
                  <CheckCircle2 className="w-10 h-10 text-blue-500" />
                </div>
                <Progress
                  value={tasks.length > 0 ? (tasks.filter((t) => t.status === 'done').length / tasks.length) * 100 : 0}
                  className="mt-4"
                />
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">En retard</p>
                    <p className="text-3xl font-bold text-red-600">{taskGroups.overdue.length}</p>
                  </div>
                  <Clock className="w-10 h-10 text-red-500" />
                </div>
              </Card>
            </div>

            {/* Tasks Sections */}
            <div className="space-y-6">
              {/* Quick Add */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ajouter une tâche rapide..."
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                  onClick={() => setTaskModalOpen(true)}
                  readOnly
                />
                <Button
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => setTaskModalOpen(true)}
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>

              {/* Overdue Tasks */}
              {taskGroups.overdue.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-red-500" />
                    En retard
                  </h3>
                  <div className="space-y-2">
                    {taskGroups.overdue.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                </div>
              )}

              {/* Today's Tasks */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <Home className="w-5 h-5 text-blue-500" />
                  Tâches du jour
                </h3>
                <div className="space-y-2">
                  {taskGroups.morning.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Matin</p>
                      <div className="space-y-2">
                        {taskGroups.morning.map((task) => (
                          <TaskCard key={task.id} task={task} />
                        ))}
                      </div>
                    </div>
                  )}

                  {taskGroups.afternoon.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 mt-4">Après-midi</p>
                      <div className="space-y-2">
                        {taskGroups.afternoon.map((task) => (
                          <TaskCard key={task.id} task={task} />
                        ))}
                      </div>
                    </div>
                  )}

                  {taskGroups.evening.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 mt-4">Soir</p>
                      <div className="space-y-2">
                        {taskGroups.evening.map((task) => (
                          <TaskCard key={task.id} task={task} />
                        ))}
                      </div>
                    </div>
                  )}

                  {taskGroups.morning.length === 0 &&
                    taskGroups.afternoon.length === 0 &&
                    taskGroups.evening.length === 0 && (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                        Aucune tâche pour aujourd'hui. Profitez de votre journée ! 🎉
                      </p>
                    )}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </main>

      <MobileNav />
    </div>
  );
}
