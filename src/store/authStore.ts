// Auth Store - Zustand
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserWithoutPassword, LoginInput, RegisterInput, AuthResponse } from '@/types';

interface AuthState {
  // State
  user: UserWithoutPassword | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: UserWithoutPassword | null) => void;
  setAccessToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  login: (credentials: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setAccessToken: (token) => set({ accessToken: token }),

      setLoading: (isLoading) => set({ isLoading }),

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
            credentials: 'include',
          });

          const data: AuthResponse = await res.json();

          if (data.success && data.data) {
            set({
              user: data.data.user,
              accessToken: data.data.accessToken,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            throw new Error(data.error || 'Erreur de connexion');
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          const responseData: AuthResponse = await res.json();

          if (responseData.success && responseData.data) {
            set({
              user: responseData.data.user,
              accessToken: responseData.data.accessToken,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            throw new Error(responseData.error || 'Erreur d\'inscription');
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
          });
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
          });
        }
      },

      refreshAccessToken: async () => {
        try {
          const res = await fetch('/api/auth/refresh', {
            method: 'POST',
            credentials: 'include',
          });

          const data: { success: boolean; data?: { accessToken: string; user: UserWithoutPassword } } = await res.json();

          if (data.success && data.data) {
            set({
              accessToken: data.data.accessToken,
              user: data.data.user,
              isAuthenticated: true,
            });
            return data.data.accessToken;
          } else {
            throw new Error('Refresh failed');
          }
        } catch (error) {
          console.error('Refresh token error:', error);
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
          });
          return null;
        }
      },

      fetchUser: async () => {
        const { accessToken } = get();
        if (!accessToken) return;

        try {
          const res = await fetch('/api/auth/me', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (res.ok) {
            const data: { success: boolean; data?: UserWithoutPassword } = await res.json();
            if (data.success && data.data) {
              set({ user: data.data });
            }
          }
        } catch (error) {
          console.error('Fetch user error:', error);
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
