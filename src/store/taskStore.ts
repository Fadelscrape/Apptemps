// Task Store - Zustand
import { create } from 'zustand';
import type { Task, TaskInput, TaskUpdate, TaskStatus } from '@/types';
import { useAuthStore } from './authStore';

function authHeaders(): Record<string, string> {
  const token = useAuthStore.getState().accessToken;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

interface TaskState {
  // State
  tasks: Task[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchTasks: (filters?: { status?: TaskStatus; priority?: string; projectId?: string; search?: string }) => Promise<void>;
  fetchTodayTasks: () => Promise<void>;
  fetchTask: (id: string) => Promise<void>;
  createTask: (data: TaskInput) => Promise<Task>;
  updateTask: (id: string, data: TaskUpdate) => Promise<Task>;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  updateTaskPosition: (id: string, position: string) => Promise<void>;
  completeTask: (id: string) => Promise<{ task: Task; xpGained: number; newLevel: number; newStreak: number; newAchievements: string[] } | undefined>;
  deleteTask: (id: string) => Promise<void>;
  addSubtask: (taskId: string, title: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  setTasks: (tasks: Task[]) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  // Initial state
  tasks: [],
  isLoading: false,
  error: null,

  // Actions
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  setTasks: (tasks) => set({ tasks }),

  fetchTasks: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.projectId) params.append('projectId', filters.projectId);
      if (filters.search) params.append('search', filters.search);

      const res = await fetch(`/api/tasks?${params}`, {
        headers: authHeaders(),
      });

      if (!res.ok) throw new Error('Erreur lors du chargement des tâches');

      const data = await res.json();
      if (data.success) {
        set({ tasks: data.data || [], isLoading: false });
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchTodayTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/tasks/today', {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Erreur lors du chargement des tâches du jour');

      const data = await res.json();
      if (data.success) {
        set({ tasks: data.data || [], isLoading: false });
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchTask: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Erreur lors du chargement de la tâche');

      const data = await res.json();
      if (data.success) {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? data.data : t)),
          isLoading: false,
        }));
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createTask: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Erreur lors de la création de la tâche');

      const result = await res.json();
      if (result.success) {
        set((state) => ({
          tasks: [result.data, ...state.tasks],
          isLoading: false,
        }));
        return result.data;
      }
      throw new Error(result.error || 'Erreur de création');
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  updateTask: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Erreur lors de la mise à jour de la tâche');

      const result = await res.json();
      if (result.success) {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? result.data : t)),
          isLoading: false,
        }));
        return result.data;
      }
      throw new Error(result.error || 'Erreur de mise à jour');
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  updateTaskStatus: async (id, status) => {
    // Optimistic update
    const { tasks } = get();
    const task = tasks.find((t) => t.id === id);
    const previousStatus = task?.status;

    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
    }));

    try {
      const res = await fetch(`/api/tasks/${id}/status`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        // Revert on error
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id && previousStatus ? { ...t, status: previousStatus } : t
          ),
        }));
        throw new Error('Erreur lors de la mise à jour du statut');
      }
    } catch (error) {
      // Revert on error
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id && previousStatus ? { ...t, status: previousStatus } : t
        ),
      }));
      throw error;
    }
  },

  updateTaskPosition: async (id, position) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, position } : t)),
    }));

    try {
      const res = await fetch(`/api/tasks/${id}/position`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ position }),
      });

      if (!res.ok) throw new Error('Erreur lors de la mise à jour de la position');
    } catch (error) {
      console.error('Position update error:', error);
    }
  },

  completeTask: async (id) => {
    const { tasks } = get();
    const task = tasks.find((t) => t.id === id);

    // Optimistic update
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              status: 'done',
              completedAt: new Date().toISOString(),
            }
          : t
      ),
    }));

    try {
      const res = await fetch(`/api/tasks/${id}/complete`, {
        method: 'PATCH',
        headers: authHeaders(),
      });

      if (!res.ok) {
        // Revert on error
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: task?.status || 'todo',
                  completedAt: undefined,
                }
              : t
          ),
        }));
        throw new Error('Erreur lors de la complétion de la tâche');
      }

      const result = await res.json();
      if (result.success && result.data) {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? result.data.task : t)),
        }));
        return result.data;
      }
    } catch (error) {
      // Revert on error
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id
            ? {
                ...t,
                status: task?.status || 'todo',
                completedAt: undefined,
              }
            : t
        ),
      }));
      throw error;
    }
  },

  deleteTask: async (id) => {
    // Optimistic update
    const { tasks } = get();
    const previousTasks = [...tasks];

    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    }));

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });

      if (!res.ok) {
        set({ tasks: previousTasks });
        throw new Error('Erreur lors de la suppression de la tâche');
      }
    } catch (error) {
      set({ tasks: previousTasks });
      throw error;
    }
  },

  addSubtask: async (taskId, title) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/subtasks`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ title }),
      });

      if (!res.ok) throw new Error('Erreur lors de l\'ajout de la sous-tâche');

      const result = await res.json();
      if (result.success) {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === taskId ? result.data : t)),
        }));
      }
    } catch (error) {
      console.error('Add subtask error:', error);
      throw error;
    }
  },

  toggleSubtask: async (taskId, subtaskId) => {
    const { tasks } = get();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const previousSubtasks = [...task.subtasks];
    const updatedSubtasks = task.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, done: !st.done } : st
    );

    // Optimistic update
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, subtasks: updatedSubtasks } : t
      ),
    }));

    try {
      const res = await fetch(`/api/tasks/${taskId}/subtasks/${subtaskId}`, {
        method: 'PATCH',
        headers: authHeaders(),
      });

      if (!res.ok) {
        // Revert
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, subtasks: previousSubtasks } : t
          ),
        }));
        throw new Error('Erreur lors de la mise à jour de la sous-tâche');
      }
    } catch (error) {
      // Revert
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId ? { ...t, subtasks: previousSubtasks } : t
        ),
      }));
      throw error;
    }
  },
}));
