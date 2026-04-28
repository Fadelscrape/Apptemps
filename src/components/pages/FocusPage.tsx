'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useTaskStore } from '@/store/taskStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Bell,
  CheckCircle2,
  Zap,
  Clock,
} from 'lucide-react';
import type { Task } from '@/types';

type PomodoroState = 'idle' | 'work' | 'break' | 'longBreak';

export default function FocusPage() {
  const { user } = useAuthStore();
  const { tasks, fetchTasks } = useTaskStore();
  const [state, setState] = useState<PomodoroState>('idle');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);
  const [isSoundEnabled, setIsSoundEnabled] = useState(user?.preferences.soundEnabled ?? true);
  const [workDuration, setWorkDuration] = useState(user?.preferences.pomodoroWork ?? 25);
  const [breakDuration, setBreakDuration] = useState(user?.preferences.pomodoroBreak ?? 5);
  const [longBreakDuration, setLongBreakDuration] = useState(user?.preferences.pomodoroLong ?? 15);

  // Filter tasks for focus (not done)
  const availableTasks = tasks.filter((t) => t.status !== 'done');

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user, fetchTasks]);

  const playSound = useCallback(() => {
    if (!isSoundEnabled) return;

    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.3;

    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.5);
    oscillator.stop(audioContext.currentTime + 0.5);

    // Second beep
    setTimeout(() => {
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      osc2.connect(gain2);
      gain2.connect(audioContext.destination);
      osc2.frequency.value = 1000;
      osc2.type = 'sine';
      gain2.gain.value = 0.3;
      osc2.start();
      gain2.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.5);
      osc2.stop(audioContext.currentTime + 0.5);
    }, 600);
  }, [isSoundEnabled]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (state !== 'idle') {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer finished
            if (state === 'work') {
              setPomodorosCompleted((prev) => prev + 1);
              playSound();

              if (pomodorosCompleted + 1 >= 4) {
                toast.success('4 pomodoros complétés ! Prenez une longue pause.');
                return longBreakDuration * 60;
              } else {
                toast.success('Pomodoro terminé ! Prenez une pause.');
                return breakDuration * 60;
              }
            } else {
              toast.success('Pause terminée ! Retour au travail.');
              return workDuration * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [state, pomodorosCompleted, workDuration, breakDuration, longBreakDuration, playSound]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (state === 'idle') {
      if (!selectedTask) {
        toast.info('Sélectionnez une tâche à accomplir');
        return;
      }
      setState('work');
      setTimeLeft(workDuration * 60);
    } else if (state === 'break' || state === 'longBreak') {
      setState('work');
      setTimeLeft(workDuration * 60);
    }
  };

  const handlePause = () => {
    if (state === 'work') {
      setState('idle');
    }
  };

  const handleBreak = () => {
    setState('break');
    setTimeLeft(breakDuration * 60);
  };

  const handleLongBreak = () => {
    setState('longBreak');
    setTimeLeft(longBreakDuration * 60);
  };

  const handleReset = () => {
    setState('idle');
    setTimeLeft(workDuration * 60);
    setPomodorosCompleted(0);
  };

  const getTitle = () => {
    switch (state) {
      case 'idle':
        return 'Prêt à vous concentrer ?';
      case 'work':
        return 'Session de travail';
      case 'break':
        return 'Pause courte';
      case 'longBreak':
        return 'Pause longue';
    }
  };

  const getSubtitle = () => {
    switch (state) {
      case 'idle':
        return 'Sélectionnez une tâche et lancez un pomodoro';
      case 'work':
        return selectedTask?.title || 'En concentration...';
      case 'break':
      case 'longBreak':
        return 'Respirez et détendez-vous';
    }
  };

  const getProgress = () => {
    const total =
      state === 'work'
        ? workDuration * 60
        : state === 'break'
        ? breakDuration * 60
        : longBreakDuration * 60;
    return ((total - timeLeft) / total) * 100;
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
            <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Mode Focus
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {getTitle()}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{getSubtitle()}</p>
        </div>

        {/* Timer */}
        <Card className="p-8 mb-6 bg-gradient-to-br from-purple-500 to-blue-500 text-white border-0">
          <div className="text-center">
            <motion.div
              key={state}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-8xl font-bold mb-4 tracking-tight">
                {formatTime(timeLeft)}
              </div>
              <div className="mb-6">
                {/* Progress Bar */}
                <div className="w-full max-w-md mx-auto bg-white/20 rounded-full h-2">
                  <motion.div
                    className="h-2 bg-white rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${getProgress()}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Pomodoro Indicators */}
            <div className="flex justify-center gap-3 mb-6">
              {[1, 2, 3, 4].map((p) => (
                <div
                  key={p}
                  className={`w-3 h-3 rounded-full ${
                    p <= pomodorosCompleted
                      ? 'bg-white'
                      : 'bg-white/40'
                  }`}
                />
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <AnimatePresence mode="wait">
                {state === 'idle' ? (
                  <motion.div
                    key="start"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <Button
                      size="lg"
                      onClick={handleStart}
                      disabled={!selectedTask}
                      className="bg-white text-purple-600 hover:bg-gray-100 px-8"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Commencer
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="pause"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <Button
                      size="lg"
                      onClick={handlePause}
                      className="bg-white text-purple-600 hover:bg-gray-100 px-8"
                    >
                      <Pause className="w-5 h-5 mr-2" />
                      Pause
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                size="lg"
                variant="outline"
                onClick={handleReset}
                className="bg-transparent text-white border-white/50 hover:bg-white/10 hover:border-white px-6"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Reset
              </Button>

              <Button
                size="icon"
                variant="outline"
                onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                className="bg-transparent text-white border-white/50 hover:bg-white/10"
              >
                {isSoundEnabled ? (
                  <Volume2 className="w-5 h-5" />
                ) : (
                  <VolumeX className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Task Selection */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            Tâche en cours
          </h3>

          <ScrollArea className="h-64">
            {availableTasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Aucune tâche disponible. Créez-en une nouvelle !
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {availableTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedTask(task)}
                    className={`p-4 rounded-lg cursor-pointer transition-all border-2 ${
                      selectedTask?.id === task.id
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{task.priority}</Badge>
                          {task.estimatedMinutes && (
                            <Badge variant="outline" className="text-xs">
                              {task.estimatedMinutes} min
                            </Badge>
                          )}
                        </div>
                      </div>
                      {selectedTask?.id === task.id && (
                        <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>
        </Card>

        {/* Settings */}
        <Card className="p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-600" />
            Paramètres du timer
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
                Travail (minutes)
              </label>
              <input
                type="number"
                value={workDuration}
                onChange={(e) => setWorkDuration(Math.max(1, parseInt(e.target.value) || 25))}
                disabled={state !== 'idle'}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
                Pause courte (minutes)
              </label>
              <input
                type="number"
                value={breakDuration}
                onChange={(e) => setBreakDuration(Math.max(1, parseInt(e.target.value) || 5))}
                disabled={state !== 'idle'}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
                Pause longue (minutes)
              </label>
              <input
                type="number"
                value={longBreakDuration}
                onChange={(e) => setLongBreakDuration(Math.max(1, parseInt(e.target.value) || 15))}
                disabled={state !== 'idle'}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 disabled:opacity-50"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
