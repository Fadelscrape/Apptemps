// Project Store - Zustand
import { create } from 'zustand';
import type { Project, ProjectInput } from '@/types';
import { useAuthStore } from './authStore';

function authHeaders(): Record<string, string> {
  const token = useAuthStore.getState().accessToken;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

interface ProjectState {
  // State
  projects: Project[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchProjects: () => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  createProject: (data: ProjectInput) => Promise<Project>;
  updateProject: (id: string, data: Partial<ProjectInput>) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  setProjects: (projects: Project[]) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  // Initial state
  projects: [],
  isLoading: false,
  error: null,

  // Actions
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setProjects: (projects) => set({ projects }),

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/projects', { headers: authHeaders() });
      if (!res.ok) throw new Error('Erreur lors du chargement des projets');

      const data = await res.json();
      if (data.success) {
        set({ projects: data.data || [], isLoading: false });
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchProject: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/projects/${id}`, { headers: authHeaders() });
      if (!res.ok) throw new Error('Erreur lors du chargement du projet');

      const data = await res.json();
      if (data.success) {
        set((state) => ({
          projects: state.projects.map((p) => (p.id === id ? data.data : p)),
          isLoading: false,
        }));
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createProject: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Erreur lors de la création du projet');

      const result = await res.json();
      if (result.success) {
        set((state) => ({
          projects: [...state.projects, result.data],
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

  updateProject: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Erreur lors de la mise à jour du projet');

      const result = await res.json();
      if (result.success) {
        set((state) => ({
          projects: state.projects.map((p) => (p.id === id ? result.data : p)),
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

  deleteProject: async (id) => {
    // Optimistic update
    const { projects } = get();
    const previousProjects = [...projects];

    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
    }));

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });

      if (!res.ok) {
        set({ projects: previousProjects });
        throw new Error('Erreur lors de la suppression du projet');
      }
    } catch (error) {
      set({ projects: previousProjects });
      throw error;
    }
  },
}));
