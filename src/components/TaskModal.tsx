'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaskStore } from '@/store/taskStore';
import { useProjectStore } from '@/store/projectStore';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { X, Plus } from 'lucide-react';
import type { TaskPriority, TaskStatus } from '@/types';

const PRIORITIES: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Faible', color: 'bg-gray-500' },
  { value: 'medium', label: 'Moyen', color: 'bg-blue-500' },
  { value: 'high', label: 'Élevé', color: 'bg-orange-500' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-500' },
];

const STATUSES: { value: TaskStatus; label: string }[] = [
  { value: 'inbox', label: 'Boîte de réception' },
  { value: 'todo', label: 'À faire' },
  { value: 'doing', label: 'En cours' },
  { value: 'review', label: 'En révision' },
  { value: 'done', label: 'Terminé' },
];

interface TaskModalProps {
  defaultStatus?: TaskStatus;
}

export default function TaskModal({ defaultStatus = 'todo' }: TaskModalProps) {
  const { taskModalOpen, setTaskModalOpen } = useUIStore();
  const { createTask } = useTaskStore();
  const { projects, fetchProjects } = useProjectStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState('');
  const [projectId, setProjectId] = useState('');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (taskModalOpen) {
      fetchProjects();
      setStatus(defaultStatus);
    }
  }, [taskModalOpen, fetchProjects, defaultStatus]);

  const handleClose = () => {
    setTaskModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setStatus(defaultStatus);
    setDueDate('');
    setDueTime('');
    setEstimatedMinutes('');
    setProjectId('');
    setTags('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        status,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        dueTime: dueTime || undefined,
        estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes) : undefined,
        projectId: projectId || undefined,
        tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      });
      toast.success('Tâche créée avec succès !');
      handleClose();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {taskModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg pointer-events-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Nouvelle tâche
                </h2>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Title */}
                <div>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Titre de la tâche *"
                    autoFocus
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-base font-medium"
                  />
                </div>

                {/* Description */}
                <div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description (optionnel)"
                    rows={2}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm"
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
                    Priorité
                  </label>
                  <div className="flex gap-2">
                    {PRIORITIES.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setPriority(p.value)}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all border-2 ${
                          priority === p.value
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                            : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                        }`}
                      >
                        <span className={`inline-block w-2 h-2 rounded-full ${p.color} mr-1`} />
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status & Project row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
                      Statut
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as TaskStatus)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
                      Projet
                    </label>
                    <select
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Aucun projet</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.emoji} {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Date & Time row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
                      Date d'échéance
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
                      Heure
                    </label>
                    <input
                      type="time"
                      value={dueTime}
                      onChange={(e) => setDueTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* Estimated time & Tags row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
                      Durée estimée (min)
                    </label>
                    <input
                      type="number"
                      value={estimatedMinutes}
                      onChange={(e) => setEstimatedMinutes(e.target.value)}
                      placeholder="ex: 30"
                      min="1"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
                      Tags (séparés par virgule)
                    </label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="ex: design, urgent"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={!title.trim() || isSubmitting}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Création...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Créer la tâche
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
