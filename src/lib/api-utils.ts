// API Utility Functions

import { createHash, randomBytes } from 'crypto';

// ============ JWT Utilities ============
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

export async function signToken(payload: any, expiresIn: string = '15m'): Promise<string> {
  const encoder = new TextEncoder();
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Date.now();
  const expPayload = {
    ...payload,
    iat: Math.floor(now / 1000),
    exp: Math.floor(now / 1000) + parseExpires(expiresIn),
  };
  const body = btoa(JSON.stringify(expPayload));
  const signatureInput = `${header}.${body}`;

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(signatureInput)
  );

  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
  return `${signatureInput}.${signatureBase64}`;
}

export async function verifyToken(token: string): Promise<any> {
  try {
    const [header, body, signature] = token.split('.');
    const encoder = new TextEncoder();
    const signatureInput = `${header}.${body}`;

    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureData = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureData,
      encoder.encode(signatureInput)
    );

    if (!isValid) {
      return null;
    }

    const payload = JSON.parse(atob(body));

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch (error) {
    return null;
  }
}

function parseExpires(expiresIn: string): number {
  if (expiresIn.endsWith('s')) return parseInt(expiresIn);
  if (expiresIn.endsWith('m')) return parseInt(expiresIn) * 60;
  if (expiresIn.endsWith('h')) return parseInt(expiresIn) * 3600;
  if (expiresIn.endsWith('d')) return parseInt(expiresIn) * 86400;
  return 900; // Default 15 minutes
}

// ============ Password Hashing ============
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + (process.env.PASSWORD_SALT || 'salt'));
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function comparePassword(candidate: string, hash: string): Promise<boolean> {
  const candidateHash = await hashPassword(candidate);
  return candidateHash === hash;
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

// ============ LexoRank for Task Ordering ============
export function generateLexoRank(after?: string, before?: string): string {
  const BASE62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  if (!after && !before) {
    return 'a0';
  }

  if (!before) {
    return incrementLexoRank(after || 'a0');
  }

  if (!after) {
    return decrementLexoRank(before);
  }

  // Find a rank between after and before
  const mid = averageLexoRank(after, before);
  if (mid) return mid;

  // If no space, shift all
  return after + '0';
}

function incrementLexoRank(rank: string): string {
  const chars = rank.split('');
  let i = chars.length - 1;

  while (i >= 0) {
    const charIndex = BASE62.indexOf(chars[i]);
    if (charIndex < BASE62.length - 1) {
      chars[i] = BASE62[charIndex + 1];
      return chars.join('');
    }
    chars[i] = '0';
    i--;
  }

  return '0' + chars.join('');
}

function decrementLexoRank(rank: string): string {
  const chars = rank.split('');
  let i = chars.length - 1;

  while (i >= 0) {
    const charIndex = BASE62.indexOf(chars[i]);
    if (charIndex > 0) {
      chars[i] = BASE62[charIndex - 1];
      return chars.join('');
    }
    chars[i] = BASE62.length - 1;
    i--;
  }

  return chars.join('');
}

function averageLexoRank(after: string, before: string): string | null {
  const len = Math.max(after.length, before.length);
  let result = '';
  let carry = 0;

  for (let i = 0; i < len; i++) {
    const a = after[i] || '0';
    const b = before[i] || '0';
    const avg = Math.floor((BASE62.indexOf(a) + BASE62.indexOf(b)) / 2) + carry;

    if (avg >= BASE62.length) {
      carry = 1;
      result += BASE62[avg - BASE62.length];
    } else {
      carry = 0;
      result += BASE62[avg];
    }
  }

  if (result <= after || result >= before) {
    return null;
  }

  return result;
}

// ============ Gamification Utilities ============
import { XP_REWARDS, XP_LEVELS } from '@/types';

export function calculateXP(priority: string, hasSubtasks: boolean = false): number {
  const base = XP_REWARDS[priority as keyof typeof XP_REWARDS] || XP_REWARDS.medium;
  return hasSubtasks ? Math.round(base * 1.1) : base;
}

export function getLevel(xp: number): number {
  return XP_LEVELS.filter(threshold => xp >= threshold).length;
}

export function getXPForNextLevel(currentXP: number): number {
  const currentLevel = getLevel(currentXP);
  if (currentLevel >= XP_LEVELS.length) return 0;
  return XP_LEVELS[currentLevel] - currentXP;
}

// ============ Date Utilities ============
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function isToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

export function isOverdue(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

export function isTomorrow(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return d.toDateString() === tomorrow.toDateString();
}

export function getStartOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getEndOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function getStartOfWeek(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getEndOfWeek(date: Date = new Date()): Date {
  const d = getStartOfWeek(date);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function getStartOfMonth(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getEndOfMonth(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  d.setHours(23, 59, 59, 999);
  return d;
}

// ============ Validation Utilities ============
export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validateUsername(username: string): boolean {
  const re = /^[a-zA-Z0-9_]{3,20}$/;
  return re.test(username);
}

export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============ Task Grouping Utilities ============
export function groupTasksByTimeOfDay(tasks: any[]): {
  overdue: any[];
  morning: any[];
  afternoon: any[];
  evening: any[];
} {
  const result = {
    overdue: [],
    morning: [],
    afternoon: [],
    evening: [],
  };

  for (const task of tasks) {
    if (task.dueDate && isOverdue(task.dueDate)) {
      result.overdue.push(task);
      continue;
    }

    if (task.dueTime) {
      const [hours] = task.dueTime.split(':').map(Number);
      if (hours >= 6 && hours < 12) {
        result.morning.push(task);
      } else if (hours >= 12 && hours < 18) {
        result.afternoon.push(task);
      } else {
        result.evening.push(task);
      }
    } else {
      result.morning.push(task);
    }
  }

  return result;
}
