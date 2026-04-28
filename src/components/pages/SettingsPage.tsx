'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Moon,
  Sun,
  Bell,
  Volume2,
  VolumeX,
  Download,
  Trash2,
  LogOut,
  Award,
  Flame,
  Zap,
} from 'lucide-react';
import type { UserPreferences } from '@/types';
import { XP_LEVELS } from '@/types';

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  // Profile
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('');

  // Preferences
  const [theme, setTheme] = useState<'dark' | 'light' | 'auto'>('auto');
  const [pomodoroWork, setPomodoroWork] = useState(25);
  const [pomodoroBreak, setPomodoroBreak] = useState(5);
  const [pomodoroLong, setPomodoroLong] = useState(15);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setAvatar(user.avatar || '');
      const prefs = user.preferences as UserPreferences;
      setTheme(prefs.theme);
      setPomodoroWork(prefs.pomodoroWork);
      setPomodoroBreak(prefs.pomodoroBreak);
      setPomodoroLong(prefs.pomodoroLong);
      setNotificationsEnabled(prefs.notificationsEnabled);
      setSoundEnabled(prefs.soundEnabled);
    }
  }, [user]);

  const getXPForNextLevel = () => {
    if (!user) return 0;
    const currentLevel = Math.min(user.level - 1, XP_LEVELS.length - 1);
    return XP_LEVELS[currentLevel + 1] - user.xp;
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, avatar }),
      });

      if (res.ok) {
        toast.success('Profil mis à jour avec succès');
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de la mise à jour');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme,
          pomodoroWork,
          pomodoroBreak,
          pomodoroLong,
          notificationsEnabled,
          soundEnabled,
        }),
      });

      if (res.ok) {
        toast.success('Préférences enregistrées');
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de l\'enregistrement');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const res = await fetch('/api/user/export');
      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `taskmaster-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        toast.success('Données exportées avec succès');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      return;
    }

    try {
      const res = await fetch('/api/user/account', {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Compte supprimé avec succès');
        logout();
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de la suppression');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur');
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Déconnexion réussie');
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 overflow-y-auto h-full">
      <div className="max-w-4xl mx-auto pb-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">Paramètres</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Gérez votre compte et vos préférences
          </p>
        </div>

        {/* User Stats Card */}
        <Card className="p-4 sm:p-6 mb-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-20 sm:h-20 flex-shrink-0 bg-white/20 rounded-full flex items-center justify-center text-2xl sm:text-4xl">
              {avatar || user?.username?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-2xl font-bold mb-1 truncate">{user?.username}</h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4 flex-shrink-0" />
                  <span>Niv. {user?.level}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Flame className="w-4 h-4 flex-shrink-0" />
                  <span>{user?.streakCurrent}j streak</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4 flex-shrink-0" />
                  <span>{user?.achievements?.length || 0} badges</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-4 sm:space-y-6">
            {/* Profile Section */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
                Profil
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="username">Nom d'utilisateur</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="votre_username"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <Input
                      id="email"
                      value={user?.email || 'Non renseigné'}
                      disabled
                      className="bg-gray-100 dark:bg-gray-800"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
                </div>
                <div>
                  <Label htmlFor="avatar">Avatar (URL)</Label>
                  <Input
                    id="avatar"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://exemple.com/avatar.png"
                  />
                </div>
                <Button onClick={handleSaveProfile} disabled={isLoading}>
                  {isLoading ? 'Sauvegarde...' : 'Sauvegarder le profil'}
                </Button>
              </div>
            </Card>

            {/* Appearance Section */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sun className="w-5 h-5 text-purple-600" />
                Apparence
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="theme">Thème</Label>
                    <p className="text-sm text-gray-500">Choisissez votre thème préféré</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={theme === 'light' ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => setTheme('light')}
                    >
                      <Sun className="w-5 h-5" />
                    </Button>
                    <Button
                      variant={theme === 'dark' ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => setTheme('dark')}
                    >
                      <Moon className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Pomodoro Section */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-600" />
                Pomodoro
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="work">Travail (min)</Label>
                    <Input
                      id="work"
                      type="number"
                      value={pomodoroWork}
                      onChange={(e) => setPomodoroWork(Math.max(1, parseInt(e.target.value) || 25))}
                      min="1"
                      max="60"
                    />
                  </div>
                  <div>
                    <Label htmlFor="break">Pause courte (min)</Label>
                    <Input
                      id="break"
                      type="number"
                      value={pomodoroBreak}
                      onChange={(e) => setPomodoroBreak(Math.max(1, parseInt(e.target.value) || 5))}
                      min="1"
                      max="30"
                    />
                  </div>
                  <div>
                    <Label htmlFor="longBreak">Pause longue (min)</Label>
                    <Input
                      id="longBreak"
                      type="number"
                      value={pomodoroLong}
                      onChange={(e) => setPomodoroLong(Math.max(1, parseInt(e.target.value) || 15))}
                      min="1"
                      max="60"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Notifications Section */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-600" />
                Notifications
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notifications push</Label>
                    <p className="text-sm text-gray-500">Recevez des rappels pour vos tâches</p>
                  </div>
                  <Switch
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sons</Label>
                    <p className="text-sm text-gray-500">Jouer des sons pour les notifications</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {soundEnabled ? (
                      <Volume2 className="w-5 h-5 text-gray-600" />
                    ) : (
                      <VolumeX className="w-5 h-5 text-gray-600" />
                    )}
                    <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                  </div>
                </div>
              </div>
            </Card>

            {/* Save Preferences */}
            <Card className="p-6">
              <Button
                onClick={handleSavePreferences}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Sauvegarde...' : 'Sauvegarder les préférences'}
              </Button>
            </Card>

            {/* Data Section */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Données</h3>
              <div className="space-y-4">
                <Button
                  variant="outline"
                  onClick={handleExportData}
                  className="w-full justify-start"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Exporter mes données
                </Button>
                <Separator />
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  className="w-full justify-start"
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  Supprimer mon compte
                </Button>
              </div>
            </Card>

            {/* Logout */}
            <Card className="p-6">
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full justify-start text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Déconnexion
              </Button>
            </Card>
          </div>
      </div>
    </div>
  );
}
