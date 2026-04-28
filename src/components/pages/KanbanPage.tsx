'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useAuthStore } from '@/store/authStore';
import { useTaskStore } from '@/store/taskStore';
import { useProjectStore } from '@/store/projectStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Plus,
  MoreHorizontal,
  Calendar,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import type { Task, TaskStatus } from '@/types';

const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'todo', title: 'À faire', color: 'border-gray-300' },
  { id: 'doing', title: 'En cours', color: 'border-blue-400' },
  { id: 'review', title: 'En révision', color: 'border-purple-400' },
  { id: 'done', title: 'Terminé', color: 'border-green-400' },
];

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-blue-500',
  low: 'bg-gray-500',
};

export default function KanbanPage() {
  const { user } = useAuthStore();
  const { tasks, fetchTasks, updateTaskStatus, completeTask } = useTaskStore();
  const { projects, fetchProjects } = useProjectStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (user) {
      fetchTasks({ status: undefined });
      fetchProjects();
    }
  }, [user, fetchTasks, fetchProjects]);

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeTask = tasks.find((t) => t.id === activeId);
    const overTask = tasks.find((t) => t.id === overId);

    if (activeTask && overTask && activeTask.status !== overTask.status) {
      // Update status visually
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeTask = tasks.find((t) => t.id === activeId);
    const overTask = tasks.find((t) => t.id === overId);

    if (activeTask && overTask && activeTask.status !== overTask.status) {
      try {
        await updateTaskStatus(activeId, overTask.status as TaskStatus);
        toast.success(`Tâche déplacée vers "${COLUMNS.find(c => c.id === overTask.status)?.title}"`);
      } catch (error: any) {
        toast.error(error.message || 'Erreur lors du déplacement');
      }
    }
  };

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

  const KanbanCard = ({ task }: { task: Task }) => {
    const project = projects.find((p) => p.id === task.projectId);

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="group"
      >
        <Card
          className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 hover:scale-[1.02]"
          style={{
            borderLeftColor:
              task.priority === 'urgent'
                ? '#ef4444'
                : task.priority === 'high'
                ? '#f97316'
                : task.priority === 'medium'
                ? '#3b82f6'
                : '#6b7280',
          }}
        >
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium text-sm flex-1 line-clamp-2">{task.title}</h4>
              <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </div>

            {task.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                {task.description}
              </p>
            )}

            <div className="flex flex-wrap gap-1">
              <Badge variant="outline" className={`text-xs ${task.status === 'done' ? 'opacity-50' : ''}`}>
                {task.priority}
              </Badge>

              {task.estimatedMinutes && (
                <Badge variant="outline" className="text-xs">
                  {task.estimatedMinutes} min
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              {project && (
                <div className="flex items-center gap-1">
                  <span className="text-sm">{project.emoji}</span>
                  <span className="truncate max-w-20">{project.name}</span>
                </div>
              )}

              {task.dueDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {new Date(task.dueDate).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>
              )}
            </div>

            {task.subtasks && task.subtasks.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <CheckCircle2 className="h-3 w-3" />
                <span>
                  {task.subtasks.filter((st) => st.done).length} / {task.subtasks.length}
                </span>
              </div>
            )}

            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {task.tags.slice(0, 2).map((tag) => (
                  <div key={tag} className="flex items-center gap-1">
                    <Tag className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">{tag}</span>
                  </div>
                ))}
                {task.tags.length > 2 && (
                  <span className="text-xs text-gray-500">+{task.tags.length - 2}</span>
                )}
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 p-6 overflow-x-auto">
          <div className="flex gap-6 h-full min-w-max">
            {COLUMNS.map((column) => {
              const columnTasks = getTasksByStatus(column.id);

              return (
                <div key={column.id} className="flex-shrink-0 w-80">
                  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col h-full">
                    {/* Column Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${PRIORITY_COLORS[column.id] || 'bg-gray-400'}`} />
                        <h3 className="font-semibold">{column.title}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {columnTasks.length}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Tasks */}
                    <ScrollArea className="flex-1 p-3">
                      <div className="space-y-3 min-h-[200px]" data-status={column.id}>
                        <AnimatePresence>
                          {columnTasks.map((task) => (
                            <KanbanCard key={task.id} task={task} />
                          ))}
                        </AnimatePresence>
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask ? (
            <Card className="p-4 w-80 bg-white dark:bg-gray-900 shadow-2xl rotate-2">
              <h4 className="font-medium">{activeTask.title}</h4>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
