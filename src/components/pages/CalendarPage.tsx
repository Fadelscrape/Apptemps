'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useTaskStore } from '@/store/taskStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { toast } from 'sonner';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { Task } from '@/types';

export default function CalendarPage() {
  const { user } = useAuthStore();
  const { tasks, fetchTasks, completeTask, deleteTask } = useTaskStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user, fetchTasks]);

  const getMonthData = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Monday = 0
    const totalDays = lastDay.getDate();

    const days = [];

    // Empty cells for days before the first of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Days of the month
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getFullYear() === date.getFullYear() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getDate() === date.getDate()
      );
    });
  };

  const handleDateClick = (date: Date) => {
    const dayTasks = getTasksForDate(date);
    setSelectedDate(date);
    setSelectedTasks(dayTasks);
  };

  const handleComplete = async (taskId: string) => {
    try {
      const result = await completeTask(taskId);
      if (result) {
        toast.success(`Tâche complétée ! +${result.xpGained} XP`);
        // Refresh selected tasks
        if (selectedDate) {
          setSelectedTasks(getTasksForDate(selectedDate));
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur');
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      toast.success('Tâche supprimée');
      if (selectedDate) {
        setSelectedTasks(getTasksForDate(selectedDate));
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur');
    }
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const PRIORITY_COLORS: Record<string, string> = {
    urgent: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-blue-500',
    low: 'bg-gray-500',
  };

  const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const CalendarDay = ({ date, index }: { date: Date | null; index: number }) => {
    if (!date) {
      return <div className="h-14 sm:h-28 bg-gray-50 dark:bg-gray-900/50 rounded-lg" />;
    }

    const dayTasks = getTasksForDate(date);
    const hasUrgentTasks = dayTasks.some((t) => t.priority === 'urgent');
    const hasHighTasks = dayTasks.some((t) => t.priority === 'high');
    const hasMediumTasks = dayTasks.some((t) => t.priority === 'medium');
    const completedCount = dayTasks.filter((t) => t.status === 'done').length;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.01 }}
        onClick={() => handleDateClick(date)}
        className={`h-14 sm:h-28 p-1 sm:p-2 rounded-lg cursor-pointer transition-all duration-200 ${
          isToday(date)
            ? 'bg-purple-100 dark:bg-purple-900/30 ring-2 ring-purple-500'
            : dayTasks.length > 0
            ? 'bg-white dark:bg-gray-800 hover:shadow-md'
            : 'bg-gray-50 dark:bg-gray-900/50'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span
            className={`text-sm font-medium ${
              isToday(date) ? 'text-purple-700 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            {date.getDate()}
          </span>
          {completedCount > 0 && (
            <Badge
              variant="secondary"
              className={`text-xs ${isToday(date) ? 'bg-purple-500 text-white' : ''}`}
            >
              {completedCount}/{dayTasks.length}
            </Badge>
          )}
        </div>

        <div className="space-y-1">
          {dayTasks.slice(0, 3).map((task) => (
            <div
              key={task.id}
              className={`text-xs px-2 py-1 rounded truncate ${
                task.status === 'done'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 line-through'
                  : `${PRIORITY_COLORS[task.priority]} text-white`
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleDateClick(date);
              }}
            >
              {task.title}
            </div>
          ))}
          {dayTasks.length > 3 && (
            <div className="text-xs text-gray-500 dark:text-gray-400 pl-2">
              +{dayTasks.length - 3} autre{dayTasks.length - 3 > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const TaskList = () => (
    <ScrollArea className="h-[calc(100vh-200px)]">
      <div className="p-4 space-y-3">
        {selectedTasks.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Aucune tâche pour cette date
            </p>
          </div>
        ) : (
          selectedTasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="group"
            >
              <Card className="p-4 border-l-4" style={{ borderLeftColor: PRIORITY_COLORS[task.priority] }}>
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleComplete(task.id)}
                    disabled={task.status === 'done'}
                    className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full border-2 transition-colors ${
                      task.status === 'done'
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300 hover:border-purple-500'
                    }`}
                  >
                    {task.status === 'done' && <CheckCircle2 className="w-5 h-5 text-white" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <h4
                      className={`font-medium mb-2 ${
                        task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      {task.title}
                    </h4>

                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          task.priority === 'urgent'
                            ? 'border-red-500 text-red-700'
                            : task.priority === 'high'
                            ? 'border-orange-500 text-orange-700'
                            : ''
                        }`}
                      >
                        {task.priority}
                      </Badge>
                      {task.estimatedMinutes && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {task.estimatedMinutes} min
                        </Badge>
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
          ))
        )}
      </div>
    </ScrollArea>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <CalendarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Calendrier</h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="outline" size="sm" onClick={goToToday} className="text-xs sm:text-sm">
              Aujourd'hui
            </Button>
            <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <Card className="p-2 sm:p-6">
          {/* Day Names */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-4">
            {DAY_NAMES.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                {day}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {getMonthData().map((date, index) => (
              <CalendarDay key={index} date={date} index={index} />
            ))}
          </div>
        </Card>

        {/* Selected Date Tasks Sheet */}
        {selectedDate && (
          <Sheet
            open={!!selectedDate}
            onOpenChange={(open) => !open && setSelectedDate(null)}
          >
            <SheetContent side="right" className="w-full sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>
                  {selectedDate.toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </SheetTitle>
              </SheetHeader>
              <TaskList />
            </SheetContent>
          </Sheet>
        )}
      </div>
    </div>
  );
}
