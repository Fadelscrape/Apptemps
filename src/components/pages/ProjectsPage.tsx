'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useProjectStore } from '@/store/projectStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Plus,
  Pencil,
  Trash2,
  FolderOpen,
  Calendar,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import type { Project, ProjectInput } from '@/types';

const COLORS = [
  '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#06b6d4', '#84cc16',
];

const EMOJIS = ['📁', '🚀', '💡', '🎯', '🔥', '⚡', '🌟', '🎨', '🛠️', '📊', '🌿', '💎'];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: 'Actif', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  'on-hold': { label: 'En pause', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  completed: { label: 'Terminé', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  archived: { label: 'Archivé', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
};

const emptyForm = (): ProjectInput => ({
  name: '',
  emoji: '📁',
  color: '#8b5cf6',
  description: '',
  deadline: undefined,
});

export default function ProjectsPage() {
  const { user } = useAuthStore();
  const { projects, isLoading, fetchProjects, createProject, updateProject, deleteProject } = useProjectStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [form, setForm] = useState<ProjectInput>(emptyForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) fetchProjects();
  }, [user, fetchProjects]);

  const openCreate = () => {
    setEditingProject(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (project: Project) => {
    setEditingProject(project);
    setForm({
      name: project.name,
      emoji: project.emoji,
      color: project.color,
      description: project.description || '',
      deadline: project.deadline ? new Date(project.deadline) : undefined,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Le nom du projet est requis');
      return;
    }
    setSaving(true);
    try {
      if (editingProject) {
        await updateProject(editingProject.id, form);
        toast.success('Projet mis à jour');
      } else {
        await createProject(form);
        toast.success('Projet créé');
      }
      setModalOpen(false);
    } catch (e: any) {
      toast.error(e.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (project: Project) => {
    if (!confirm(`Supprimer le projet "${project.name}" ?`)) return;
    try {
      await deleteProject(project.id);
      toast.success('Projet archivé');
    } catch (e: any) {
      toast.error(e.message || 'Erreur');
    }
  };

  const getProgress = (project: Project) => {
    const tasks = project.tasks || [];
    if (tasks.length === 0) return 0;
    return Math.round((tasks.filter((t) => t.status === 'done').length / tasks.length) * 100);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Projets</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {projects.length} projet{projects.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button onClick={openCreate} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Nouveau projet</span>
            <span className="sm:hidden">Nouveau</span>
          </Button>
        </div>

        {/* Empty state */}
        {!isLoading && projects.length === 0 && (
          <div className="text-center py-16">
            <FolderOpen className="w-14 h-14 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">Aucun projet pour l'instant</p>
            <Button onClick={openCreate} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Créer mon premier projet
            </Button>
          </div>
        )}

        {/* Projects grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {projects.map((project) => {
              const progress = getProgress(project);
              const totalTasks = project.tasks?.length || 0;
              const doneTasks = project.tasks?.filter((t) => t.status === 'done').length || 0;
              const status = STATUS_LABELS[project.status] || STATUS_LABELS.active;

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card
                    className="p-4 hover:shadow-lg transition-shadow border-t-4"
                    style={{ borderTopColor: project.color }}
                  >
                    {/* Card header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-2xl flex-shrink-0">{project.emoji}</span>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {project.name}
                          </h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-gray-400 hover:text-purple-600"
                          onClick={() => openEdit(project)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-gray-400 hover:text-red-500"
                          onClick={() => handleDelete(project)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Description */}
                    {project.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                        {project.description}
                      </p>
                    )}

                    {/* Progress */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {doneTasks}/{totalTasks} tâches
                        </span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-1.5" />
                    </div>

                    {/* Deadline */}
                    {project.deadline && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(project.deadline).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="w-full max-w-md mx-4">
          <DialogHeader>
            <DialogTitle>
              {editingProject ? 'Modifier le projet' : 'Nouveau projet'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Emoji picker */}
            <div>
              <Label className="mb-2 block">Icône</Label>
              <div className="flex flex-wrap gap-2">
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    onClick={() => setForm((f) => ({ ...f, emoji: e }))}
                    className={`text-xl w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                      form.emoji === e
                        ? 'bg-purple-100 dark:bg-purple-900/40 ring-2 ring-purple-500'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <Label htmlFor="proj-name">Nom *</Label>
              <Input
                id="proj-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Mon projet"
                className="mt-1"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="proj-desc">Description</Label>
              <Input
                id="proj-desc"
                value={form.description || ''}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Description optionnelle"
                className="mt-1"
              />
            </div>

            {/* Color */}
            <div>
              <Label className="mb-2 block">Couleur</Label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setForm((f) => ({ ...f, color: c }))}
                    className={`w-8 h-8 rounded-full transition-transform ${
                      form.color === c ? 'scale-125 ring-2 ring-offset-2 ring-gray-400' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Deadline */}
            <div>
              <Label htmlFor="proj-deadline">Date limite</Label>
              <Input
                id="proj-deadline"
                type="date"
                value={form.deadline ? new Date(form.deadline).toISOString().split('T')[0] : ''}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    deadline: e.target.value ? new Date(e.target.value) : undefined,
                  }))
                }
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {saving ? 'Sauvegarde...' : editingProject ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
