'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Loader2, Flame, Target, Trophy } from 'lucide-react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, register } = useAuthStore();

  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
    rememberMe: false,
  });

  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(loginData);
      toast.success('Connexion réussie !');
      router.push('/');
    } catch (error: any) {
      toast.error(error.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      setIsLoading(false);
      return;
    }

    try {
      await register(registerData);
      toast.success('Compte créé avec succès !');
      router.push('/');
    } catch (error: any) {
      toast.error(error.message || 'Erreur d\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 shadow-2xl border-2 border-purple-100 dark:border-purple-900">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className="w-10 h-10 text-purple-600 dark:text-purple-400" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                TaskMaster Pro
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {isLogin ? 'Connectez-vous pour continuer' : 'Créez votre compte'}
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900 rounded-lg p-3 mb-2">
                <Flame className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto" />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Streaks</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-3 mb-2">
                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto" />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Objectifs</p>
            </div>
            <div className="text-center">
              <div className="bg-amber-100 dark:bg-amber-900 rounded-lg p-3 mb-2">
                <Trophy className="w-6 h-6 text-amber-600 dark:text-amber-400 mx-auto" />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Achievements</p>
            </div>
          </div>

          {/* Login Form */}
          {isLogin ? (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleLogin}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="username">Nom d'utilisateur</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="votre_username"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={loginData.rememberMe}
                  onCheckedChange={(checked) =>
                    setLoginData({ ...loginData, rememberMe: checked as boolean })
                  }
                  disabled={isLoading}
                />
                <Label htmlFor="remember" className="text-sm cursor-pointer">
                  Se souvenir de moi
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  'Se connecter'
                )}
              </Button>

              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Pas encore de compte ?{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="text-purple-600 hover:text-purple-700 font-semibold"
                >
                  S'inscrire
                </button>
              </p>
            </motion.form>
          ) : (
            <motion.form
              key="register"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleRegister}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="reg-username">Nom d'utilisateur</Label>
                <Input
                  id="reg-username"
                  type="text"
                  placeholder="votre_username"
                  value={registerData.username}
                  onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-email">Email (optionnel)</Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="votre@email.com"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-password">Mot de passe</Label>
                <Input
                  id="reg-password"
                  type="password"
                  placeholder="••••••••"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  required
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500">
                  Min. 8 caractères avec majuscule, minuscule, chiffre et caractère spécial
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-confirm">Confirmer le mot de passe</Label>
                <Input
                  id="reg-confirm"
                  type="password"
                  placeholder="••••••••"
                  value={registerData.confirmPassword}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, confirmPassword: e.target.value })
                  }
                  required
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Inscription...
                  </>
                ) : (
                  'Créer mon compte'
                )}
              </Button>

              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Déjà un compte ?{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="text-purple-600 hover:text-purple-700 font-semibold"
                >
                  Se connecter
                </button>
              </p>
            </motion.form>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
