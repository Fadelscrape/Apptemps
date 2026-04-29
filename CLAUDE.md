# CLAUDE.md — TaskMaster Pro
## Cahier des charges complet pour Claude Code

> Ce fichier est la source de vérité du projet. Lis-le intégralement avant de générer le moindre fichier.

---

## CONTEXTE DU PROJET

Tu dois construire **TaskMaster Pro**, une application full-stack de gestion de tâches moderne, intelligente et gamifiée. L'utilisateur est seul développeur, débutant-intermédiaire, qui veut une app qu'il utilisera tous les jours pour suivre ses tâches.

**Répertoire de travail :** `D:\PROJETS_2025\AppliGestionTâche`
**Node version :** v22.18.0

---

## STACK TECHNIQUE — NE PAS DÉVIER

### Frontend (dossier `/client`)
```
React 18 + Vite 5 + TypeScript
TailwindCSS 3                    — styling utilitaire
Framer Motion 11                 — animations
Zustand 5                        — state management
React Router DOM v6              — navigation
React Hook Form ^7.73 + Zod ^4   — formulaires + validation
@dnd-kit/core ^6.3 + @dnd-kit/sortable ^10   — drag & drop Kanban
Recharts 2                       — graphiques analytics
Lucide React                     — icônes
React Hot Toast                  — notifications toast
Axios                            — requêtes HTTP
vite-plugin-pwa ^1.2             — PWA + Service Worker
```

### Backend (dossier `/server`)
```
Node.js v22 + Express ^5.1
TypeScript
Mongoose ^8.15               — ODM MongoDB
bcryptjs ^3.0.3              — hachage mot de passe
jsonwebtoken ^9.0.3          — tokens JWT
zod ^4.3                     — validation requêtes
cors ^2.8.5                  — gestion CORS
helmet ^8.1                  — sécurité HTTP
express-rate-limit ^7.5      — rate limiting
morgan                       — logs HTTP
dotenv ^16.4                 — variables d'environnement
web-push ^3.6.7              — push notifications VAPID
```

### Base de données
```
MongoDB Atlas
URI      : mongodb+srv://juniorsohou57:MonBudget2026!@cluster0.fgjbh9x.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
Database : taskmaster
```

### Déploiement
```
Frontend → Vercel
Backend  → Railway (ou Render)
```

---

## STRUCTURE DE FICHIERS À GÉNÉRER

```
AppliGestionTâche/
├── CLAUDE.md                         ← CE FICHIER
├── .gitignore
├── README.md
│
├── client/                           ← FRONTEND REACT
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   ├── .env.example                  ← VITE_API_URL=http://localhost:8080
│   ├── public/
│   │   ├── pwa-192x192.png
│   │   ├── pwa-512x512.png
│   │   └── maskable-icon-512x512.png
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── sw.ts                     ← Service Worker custom (push + cache)
│       ├── types/
│       │   └── index.ts              ← TOUS les types TypeScript globaux
│       ├── lib/
│       │   ├── axios.ts              ← Instance Axios + intercepteur refresh
│       │   └── utils.ts             ← cn(), formatDate(), etc.
│       ├── store/
│       │   ├── authStore.ts          ← user, accessToken, login, logout
│       │   ├── taskStore.ts          ← tasks CRUD + optimistic updates
│       │   ├── projectStore.ts       ← projects CRUD
│       │   └── uiStore.ts            ← theme, sidebar, modals
│       ├── hooks/
│       │   ├── useAuth.ts
│       │   ├── useTasks.ts
│       │   ├── usePomodoro.ts
│       │   └── useNotifications.ts
│       ├── pages/
│       │   ├── auth/
│       │   │   ├── LoginPage.tsx
│       │   │   └── RegisterPage.tsx
│       │   ├── DashboardPage.tsx     ← Vue "Aujourd'hui"
│       │   ├── KanbanPage.tsx
│       │   ├── CalendarPage.tsx
│       │   ├── AnalyticsPage.tsx
│       │   ├── FocusPage.tsx
│       │   └── SettingsPage.tsx
│       ├── components/
│       │   ├── layout/
│       │   │   ├── AppLayout.tsx     ← Sidebar + TopBar + Outlet
│       │   │   ├── Sidebar.tsx
│       │   │   └── TopBar.tsx
│       │   ├── auth/
│       │   │   ├── ProtectedRoute.tsx
│       │   │   └── AuthLayout.tsx
│       │   ├── tasks/
│       │   │   ├── TaskCard.tsx
│       │   │   ├── TaskForm.tsx      ← Création + édition modale
│       │   │   ├── TaskList.tsx
│       │   │   └── SubtaskList.tsx
│       │   ├── kanban/
│       │   │   ├── KanbanBoard.tsx
│       │   │   ├── KanbanColumn.tsx
│       │   │   └── DragOverlayCard.tsx
│       │   ├── analytics/
│       │   │   ├── HeatMap.tsx
│       │   │   ├── StatsCards.tsx
│       │   │   └── WeeklyChart.tsx
│       │   ├── focus/
│       │   │   ├── PomodoroTimer.tsx
│       │   │   └── FocusMode.tsx
│       │   ├── gamification/
│       │   │   ├── XPBar.tsx
│       │   │   ├── StreakBadge.tsx
│       │   │   └── Achievements.tsx
│       │   └── ui/                   ← Composants réutilisables
│       │       ├── Button.tsx
│       │       ├── Input.tsx
│       │       ├── Modal.tsx
│       │       ├── Badge.tsx
│       │       ├── CommandPalette.tsx
│       │       └── ConfettiEffect.tsx
│       └── schemas/
│           └── auth.schema.ts        ← Schémas Zod partagés front/back
│
└── server/                           ← BACKEND EXPRESS
    ├── package.json
    ├── tsconfig.json
    ├── .env.example
    ├── vercel.json                   ← Config si déployé sur Vercel
    └── src/
        ├── server.ts                 ← connectDB() + listen()
        ├── app.ts                    ← Express app (sans listen)
        ├── config/
        │   ├── db.ts                 ← Connexion Mongoose avec cache
        │   ├── cors.ts               ← Config CORS dynamique
        │   └── env.ts                ← Validation vars d'env au démarrage
        ├── models/
        │   ├── User.model.ts
        │   ├── Task.model.ts
        │   ├── Project.model.ts
        │   ├── Tag.model.ts
        │   └── PushSubscription.model.ts
        ├── routes/
        │   ├── auth.routes.ts
        │   ├── task.routes.ts
        │   ├── project.routes.ts
        │   ├── tag.routes.ts
        │   ├── analytics.routes.ts
        │   └── push.routes.ts
        ├── controllers/
        │   ├── auth.controller.ts
        │   ├── task.controller.ts
        │   ├── project.controller.ts
        │   └── analytics.controller.ts
        ├── services/
        │   ├── auth.service.ts       ← logique métier auth (testable)
        │   ├── task.service.ts
        │   └── push.service.ts       ← envoi web-push + purge morts
        ├── middlewares/
        │   ├── auth.middleware.ts    ← verifyAccessToken
        │   ├── validate.middleware.ts← zodMiddleware(schema)
        │   ├── error.middleware.ts   ← handler global erreurs
        │   └── notFound.middleware.ts
        ├── validators/
        │   ├── auth.validator.ts     ← registerSchema, loginSchema (Zod)
        │   ├── task.validator.ts
        │   └── project.validator.ts
        └── utils/
            ├── ApiError.ts
            ├── asyncHandler.ts
            └── tokens.ts             ← signAccessToken, signRefreshToken, sha256
```

---

## MODÈLES DE DONNÉES (Mongoose)

### User
```typescript
interface IUser {
  _id: ObjectId;
  username: string;          // unique, 3-20 chars, /^[a-zA-Z0-9_]+$/
  email?: string;            // optionnel
  password: string;          // select: false — bcryptjs, genSalt(12)
  avatar?: string;           // URL ou initiales
  refreshTokenHash?: string; // SHA-256 du refresh token, select: false

  // Gamification
  xp: number;                // default 0
  level: number;             // calculé (1-10+)
  streakCurrent: number;     // jours consécutifs
  streakBest: number;
  lastActivityDate?: Date;
  achievements: string[];    // IDs des achievements débloqués

  // Préférences
  preferences: {
    theme: 'dark' | 'light' | 'auto';
    pomodoroWork: number;     // default 25
    pomodoroBreak: number;    // default 5
    pomodoroLong: number;     // default 15
    notificationsEnabled: boolean;
    soundEnabled: boolean;
  };

  createdAt: Date;
  updatedAt: Date;
}
// Hook pre('save') : hacher password si modifié
// Méthode : comparePassword(candidate) → Promise<boolean>
```

### Task
```typescript
interface ITask {
  _id: ObjectId;
  owner: ObjectId;           // ref User — index
  project?: ObjectId;        // ref Project — index
  title: string;             // max 200
  description?: string;      // Markdown
  status: 'inbox' | 'todo' | 'doing' | 'review' | 'done';  // index
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;            // index
  dueTime?: string;          // "HH:MM"
  estimatedMinutes?: number;
  actualMinutes?: number;
  tags: ObjectId[];          // ref Tag
  position: string;          // LexoRank — index
  subtasks: Array<{
    _id: ObjectId;
    title: string;
    done: boolean;
    order: number;
  }>;
  reminders: Array<{
    remindAt: Date;
    sent: boolean;
  }>;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
    interval: number;        // tous les X jours/semaines/mois
    daysOfWeek?: number[];   // 0-6 pour weekly
    endDate?: Date;
  };
  pomodorosUsed: number;     // default 0
  notes?: string;
  completedAt?: Date;
  deletedAt?: Date;          // soft delete — index (TTL 30j)
  xpReward: number;          // calculé selon priorité
  createdAt: Date;
  updatedAt: Date;
}
// Indexes : { owner,status,position }, { owner,dueDate }, { owner,deletedAt,updatedAt }
// Virtual : isOverdue, subtaskProgress { done, total, pct }
// optimisticConcurrency: true
```

### Project
```typescript
interface IProject {
  _id: ObjectId;
  owner: ObjectId;
  name: string;              // max 100
  emoji: string;             // ex: "🚀"
  color: string;             // hex color
  description?: string;
  deadline?: Date;
  status: 'active' | 'on-hold' | 'completed' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}
// Virtual : tasks (ref Task), progress (calculé depuis tasks)
```

### PushSubscription
```typescript
interface IPushSubscription {
  userId: ObjectId;
  endpoint: string;          // unique
  keys: { p256dh: string; auth: string; };
  expirationTime?: Date;
  userAgent?: string;
  createdAt: Date;
}
```

---

## AUTHENTIFICATION — IMPLÉMENTER EXACTEMENT AINSI

### Stratégie tokens
- **Access Token** : JWT, expiry 15min, signé avec `JWT_ACCESS_SECRET`
- **Refresh Token** : JWT, expiry 7j, signé avec `JWT_REFRESH_SECRET`
- **Stockage access token** : Zustand en mémoire UNIQUEMENT (jamais localStorage)
- **Stockage refresh token** : Cookie `HttpOnly; Secure; SameSite=Strict; Path=/api/auth`
- **En DB** : stocker `sha256(refreshToken)`, jamais le token brut
- **Rotation** : nouveau refresh token à chaque `/auth/refresh`
- **Détection réutilisation** : si refresh déjà utilisé → révoquer toute la session

### Routes Auth
```
POST /api/auth/register   → { username, password } → crée user → retourne { accessToken, user }
POST /api/auth/login      → { username, password } → { accessToken, user } + cookie refresh
POST /api/auth/refresh    → (cookie) → { accessToken } + nouveau cookie refresh
POST /api/auth/logout     → supprime refreshTokenHash en DB + clear cookie
GET  /api/auth/me         → (Bearer) → { user }
```

### Intercepteur Axios (client/src/lib/axios.ts)
- Ajoute `Authorization: Bearer <accessToken>` à chaque requête
- Sur réponse 401 → appelle `/auth/refresh` en `single-flight` (une seule tentative simultanée)
- Si refresh OK → retry la requête originale avec le nouveau token
- Si refresh échoue → logout() + redirect `/login`

---

## ROUTES API COMPLÈTES

### Tasks `/api/tasks`
```
GET    /                  → Liste paginée (query: status, priority, projectId, tag, search, page, limit)
GET    /today             → Tâches du jour (dueDate=today + overdue non faites)
GET    /:id               → Détail d'une tâche
POST   /                  → Créer une tâche
PUT    /:id               → Modifier une tâche
PATCH  /:id/status        → Changer status (pour Kanban)
PATCH  /:id/position      → Changer position LexoRank (drag & drop)
PATCH  /:id/complete      → Marquer done → calcule XP → met à jour streak user
DELETE /:id               → Soft delete (deletedAt = now)
DELETE /:id/hard          → Suppression définitive
POST   /:id/subtasks      → Ajouter sous-tâche
PATCH  /:id/subtasks/:sid → Cocher/modifier sous-tâche
```

### Projects `/api/projects`
```
GET    /          → Tous les projets de l'user
POST   /          → Créer projet
PUT    /:id       → Modifier
DELETE /:id       → Archiver (soft)
GET    /:id/tasks → Tâches du projet
```

### Analytics `/api/analytics`
```
GET /summary        → { todayCompleted, todayTotal, weekCompleted, streakCurrent, totalXP, level }
GET /heatmap        → Tableau 365 jours { date, count }[]
GET /weekly         → Tâches complétées par jour sur 7 jours
GET /priorities     → Répartition par priorité
```

### Push `/api/push`
```
POST /subscribe     → Enregistrer subscription WebPush
DELETE /unsubscribe → Supprimer subscription
```

---

## PAGES — DESCRIPTION DÉTAILLÉE

### Page Register (`/register`)
- Formulaire : Nom d'utilisateur + Mot de passe + Confirmer mot de passe
- Validation Zod : username min 3, max 20, alphanum+underscore / password min 8 (1 maj, 1 min, 1 chiffre, 1 spécial)
- Affichage erreurs inline sous chaque champ
- Indicateur de force du mot de passe (4 barres colorées)
- Lien vers `/login`
- Animation : fade-in + slide-up de la carte avec Framer Motion
- Après succès : toast "Compte créé !" + redirect `/dashboard`

### Page Login (`/login`)
- Formulaire : Nom d'utilisateur + Mot de passe
- Checkbox "Se souvenir de moi" (prolonge refresh à 30j)
- Lien vers `/register`
- Même animations
- Après succès : redirect vers page précédente ou `/dashboard`

### Dashboard — Vue Aujourd'hui (`/dashboard`)
**Section Hero :**
- Grande barre de progression circulaire (SVG animé) : tâches faites / total du jour
- Texte dynamique : "Excellent ! 3/5 tâches complétées"
- Score du jour en % (animé au chargement)
- Streak badge animé (flamme + nombre de jours)
- Niveau XP actuel avec barre de progression

**Section Tâches du jour :**
- Liste des tâches du jour (dueDate = aujourd'hui) + overdue
- Groupées par : En retard / Ce matin / Cet après-midi / Ce soir
- Chaque tâche : checkbox animée, titre, priorité badge, durée estimée, tag, bouton ⋮ (menu)
- Cocher une tâche → animation de complétion + confettis si urgente + toast "+X XP"
- Bouton "Ajouter une tâche rapide" → modal TaskForm

**Section Barre Latérale (desktop) :**
- Mini Pomodoro timer
- Prochaines tâches (3 prochains jours)
- Streak et XP

### Kanban (`/kanban`)
- 4 colonnes : À faire / En cours / En révision / Terminé
- Drag & drop inter-colonnes et intra-colonne avec @dnd-kit
- Chaque carte : titre, priorité (couleur bordure gauche), tags, date échéance, sous-tâches (X/Y), avatar projet
- Colonne "Terminé" : fond légèrement différent, tâches grisées
- Bouton "+" en haut de chaque colonne pour ajouter une tâche
- DragOverlay : carte fantôme légèrement rotée

### Calendrier (`/calendar`)
- Vue mensuelle (React custom, pas de librairie externe)
- Chaque jour : nombre de tâches + points colorés par priorité
- Cliquer un jour → panneau latéral avec liste des tâches ce jour
- Navigation mois précédent/suivant

### Analytics (`/analytics`)
- **Heatmap** : 52 semaines, style GitHub, vert plus foncé = plus de tâches
- **Graphique barres** : tâches par jour (7 derniers jours)
- **Camembert** : répartition par priorité
- **Cards métriques** : taux complétion / tâches ce mois / meilleur streak / niveau

### Focus (`/focus`)
- Pomodoro timer plein écran
- Sélection de la tâche en cours
- Boutons play/pause/reset
- Indicateur des pomodoros : ● ● ● ○ (3/4 complétés)
- Après 4 pomodoros → longue pause automatique
- Son de fin (gong doux) si activé
- Mode immersif : masque sidebar

### Settings (`/settings`)
- Profil : modifier username, avatar
- Apparence : thème dark/light/auto
- Pomodoro : durées personnalisables
- Notifications : activer/désactiver + test push
- Données : export JSON, supprimer compte
- Déconnexion

---

## GAMIFICATION — LOGIQUE PRÉCISE

### Calcul XP par complétion
```typescript
function calculateXP(task: ITask): number {
  const base = { low: 10, medium: 25, high: 50, urgent: 100 }[task.priority];
  const earlyBonus = task.dueDate && new Date() < task.dueDate ? 1.2 : 1;
  const subtaskBonus = task.subtasks.length > 0 ? 1.1 : 1;
  return Math.round(base * earlyBonus * subtaskBonus);
}
```

### Niveaux
```typescript
const LEVELS = [0, 500, 1500, 3500, 7000, 12000, 20000, 32000, 50000, 75000, 100000];
// Niveau 1 à 11 (Novice → Légende)
function getLevel(xp: number): number {
  return LEVELS.filter(threshold => xp >= threshold).length;
}
```

### Mise à jour streak (côté serveur, endpoint /complete)
```typescript
// Après completion d'une tâche :
const today = new Date().toDateString();
const lastDate = user.lastActivityDate?.toDateString();
if (lastDate === today) {
  // Déjà actif aujourd'hui, pas de changement streak
} else if (lastDate === yesterday) {
  user.streakCurrent += 1;
  user.streakBest = Math.max(user.streakBest, user.streakCurrent);
} else {
  user.streakCurrent = 1; // reset
}
user.lastActivityDate = new Date();
user.xp += xpGained;
user.level = getLevel(user.xp);
```

### Achievements (vérifier après chaque complétion)
```typescript
const ACHIEVEMENTS = [
  { id: 'first_task',    label: 'Premier Pas',      condition: (u) => u.totalCompleted >= 1 },
  { id: 'streak_7',      label: 'Série de 7 jours', condition: (u) => u.streakCurrent >= 7 },
  { id: 'streak_30',     label: 'Mois parfait',      condition: (u) => u.streakCurrent >= 30 },
  { id: 'tasks_100',     label: 'Centenaire',        condition: (u) => u.totalCompleted >= 100 },
  { id: 'tasks_10_day',  label: 'Productivité Max',  condition: (u) => u.todayCompleted >= 10 },
  { id: 'level_5',       label: 'Expert',            condition: (u) => u.level >= 5 },
  { id: 'pomodoro_25',   label: 'Maître Focus',      condition: (u) => u.totalPomodoros >= 25 },
  { id: 'urgent_5',      label: 'Pompier',           condition: (u) => u.urgentCompleted >= 5 },
  { id: 'early_10',      label: 'Ponctuel',          condition: (u) => u.earlyCompleted >= 10 },
  { id: 'night_owl',     label: 'Oiseau de nuit',    condition: (u) => u.lateTaskCompleted >= 1 },
];
```

---

## ANIMATIONS — RÈGLES FRAMER MOTION

```typescript
// Variants réutilisables à définir dans src/lib/variants.ts

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -10 },
};

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.07 } },
};

export const cardHover = {
  whileHover: { scale: 1.01, transition: { duration: 0.15 } },
  whileTap: { scale: 0.99 },
};

export const taskComplete = {
  // Animation quand une tâche est cochée
  animate: { scale: [1, 1.05, 0.95, 1], transition: { duration: 0.3 } },
};

// Confettis : utiliser canvas-confetti pour les tâches urgentes
// XP gained : toast custom animé "+50 XP !" avec keyframe slideIn
```

---

## VARIABLES D'ENVIRONNEMENT

### `/server/.env.example`
```env
NODE_ENV=development
PORT=8080
MONGODB_URI=mongodb+srv://juniorsohou57:MonBudget2026!@cluster0.fgjbh9x.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
MONGODB_DB=taskmaster
JWT_ACCESS_SECRET=CHANGE_ME_ACCESS_SECRET_32_CHARS_MIN
JWT_REFRESH_SECRET=CHANGE_ME_REFRESH_SECRET_32_CHARS_MIN
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
CLIENT_URL=http://localhost:5173
VAPID_PUBLIC_KEY=GENERATE_WITH_npx_web-push_generate-vapid-keys
VAPID_PRIVATE_KEY=GENERATE_WITH_npx_web-push_generate-vapid-keys
VAPID_SUBJECT=mailto:juniorsohou57@gmail.com
```

### `/client/.env.example`
```env
VITE_API_URL=http://localhost:8080
VITE_VAPID_PUBLIC_KEY=SAME_AS_SERVER_VAPID_PUBLIC_KEY
```

---

## CONFIGURATION CORS (server/src/config/cors.ts)

```typescript
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL!,
].filter(Boolean);

// Accepte aussi les URLs de preview Vercel dynamiques
const VERCEL_PREVIEW = /^https:\/\/appli-gestion-tache-[a-z0-9-]+-.*\.vercel\.app$/;

export const corsOptions = {
  origin: (origin: string | undefined, cb: Function) => {
    if (!origin) return cb(null, true); // curl/Postman
    if (ALLOWED_ORIGINS.includes(origin) || VERCEL_PREVIEW.test(origin)) return cb(null, true);
    cb(new Error(`CORS bloqué pour l'origine: ${origin}`));
  },
  credentials: true,
  methods: ['GET','HEAD','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
};
```

---

## CONNEXION MONGODB (server/src/config/db.ts)

```typescript
import mongoose from 'mongoose';

let cached = (global as any)._mongoose ?? ((global as any)._mongoose = { conn: null, promise: null });

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI!, {
      dbName: process.env.MONGODB_DB || 'taskmaster',
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
```

---

## THÈME TAILWIND — DESIGN DARK/LIGHT

```typescript
// tailwind.config.ts
// Palette principale :
// Background dark  : #0f0f13 (app), #1a1a24 (card), #252532 (input)
// Background light : #f8f9fa (app), #ffffff (card), #f1f3f5 (input)
// Accent principal : #7c3aed (violet-600) → hover #6d28d9
// Accent success   : #10b981 (emerald-500)
// Accent danger    : #ef4444 (red-500)
// Accent warning   : #f59e0b (amber-500)
// Priorité urgent  : #ef4444 | high : #f97316 | medium : #3b82f6 | low : #6b7280

// CSS variables sur :root + .dark pour le thème
// Exemple dans index.css :
// :root { --bg-primary: #f8f9fa; --bg-card: #ffffff; --accent: #7c3aed; }
// .dark { --bg-primary: #0f0f13; --bg-card: #1a1a24; --accent: #8b5cf6; }
```

---

## DÉPLOIEMENT — ÉTAPES EXACTES

### Backend sur Railway
```bash
# Dans le dossier /server
# 1. Créer un Dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build
EXPOSE 8080
CMD ["node", "dist/server.js"]

# 2. Pusher sur GitHub
# 3. Connecter Railway à ce repo, pointer sur /server
# 4. Ajouter les variables d'environnement dans Railway
# 5. Récupérer l'URL Railway (ex: https://taskmaster-api.railway.app)
```

### Frontend sur Vercel
```bash
# 1. Dans /client, ajouter vercel.json :
{ "rewrites": [{ "source": "/((?!api).*)", "destination": "/index.html" }] }

# 2. Dans les settings Vercel :
# - Root Directory: client
# - Build Command: npm run build
# - Output Directory: dist
# - Env vars: VITE_API_URL=https://taskmaster-api.railway.app
#             VITE_VAPID_PUBLIC_KEY=<ta_clé_publique>
```

### MongoDB Atlas
```
1. Network Access → Add IP Address → Allow access from anywhere (0.0.0.0/0)
   (Vercel n'a pas d'IP fixe — obligatoire)
2. Database Access → User juniorsohou57 → rôle readWrite sur database "taskmaster" uniquement
```

---

## COMMANDES NPM — SCRIPTS À GÉNÉRER

### `/server/package.json` scripts
```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.ts",
    "generate-vapid": "npx web-push generate-vapid-keys --json"
  }
}
```

### `/client/package.json` scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "pwa-icons": "pwa-assets-generator --preset minimal-2023 public/logo.svg"
  }
}
```

### Script de démarrage racine `/package.json`
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev --prefix server\" \"npm run dev --prefix client\"",
    "install:all": "npm install && npm install --prefix client && npm install --prefix server"
  },
  "devDependencies": {
    "concurrently": "^9.0.0"
  }
}
```

---

## ORDRE DE GÉNÉRATION DES FICHIERS

Génère les fichiers dans cet ordre précis :

1. `/package.json` (racine avec concurrently)
2. `.gitignore`
3. `/server/package.json`
4. `/server/tsconfig.json`
5. `/server/.env.example`
6. `/server/src/config/env.ts`
7. `/server/src/config/db.ts`
8. `/server/src/config/cors.ts`
9. `/server/src/utils/ApiError.ts`
10. `/server/src/utils/asyncHandler.ts`
11. `/server/src/utils/tokens.ts`
12. `/server/src/models/User.model.ts`
13. `/server/src/models/Task.model.ts`
14. `/server/src/models/Project.model.ts`
15. `/server/src/models/Tag.model.ts`
16. `/server/src/models/PushSubscription.model.ts`
17. `/server/src/validators/auth.validator.ts`
18. `/server/src/validators/task.validator.ts`
19. `/server/src/validators/project.validator.ts`
20. `/server/src/middlewares/validate.middleware.ts`
21. `/server/src/middlewares/auth.middleware.ts`
22. `/server/src/middlewares/error.middleware.ts`
23. `/server/src/middlewares/notFound.middleware.ts`
24. `/server/src/services/auth.service.ts`
25. `/server/src/services/task.service.ts`
26. `/server/src/services/push.service.ts`
27. `/server/src/controllers/auth.controller.ts`
28. `/server/src/controllers/task.controller.ts`
29. `/server/src/controllers/project.controller.ts`
30. `/server/src/controllers/analytics.controller.ts`
31. `/server/src/routes/auth.routes.ts`
32. `/server/src/routes/task.routes.ts`
33. `/server/src/routes/project.routes.ts`
34. `/server/src/routes/analytics.routes.ts`
35. `/server/src/routes/push.routes.ts`
36. `/server/src/app.ts`
37. `/server/src/server.ts`
38. `/client/package.json`
39. `/client/tsconfig.json`
40. `/client/vite.config.ts`
41. `/client/tailwind.config.ts`
42. `/client/index.html`
43. `/client/.env.example`
44. `/client/src/types/index.ts`
45. `/client/src/lib/axios.ts`
46. `/client/src/lib/utils.ts`
47. `/client/src/lib/variants.ts`
48. `/client/src/store/authStore.ts`
49. `/client/src/store/taskStore.ts`
50. `/client/src/store/projectStore.ts`
51. `/client/src/store/uiStore.ts`
52. `/client/src/schemas/auth.schema.ts`
53. `/client/src/sw.ts`
54. `/client/src/hooks/useAuth.ts`
55. `/client/src/hooks/useTasks.ts`
56. `/client/src/hooks/usePomodoro.ts`
57. `/client/src/hooks/useNotifications.ts`
58. → Composants UI de base (Button, Input, Modal, Badge)
59. → Composants Layout (AppLayout, Sidebar, TopBar)
60. → Pages Auth (Login, Register)
61. → ProtectedRoute
62. → TaskCard, TaskForm, TaskList
63. → KanbanBoard, KanbanColumn, DragOverlayCard
64. → PomodoroTimer, FocusMode
65. → HeatMap, StatsCards, WeeklyChart
66. → XPBar, StreakBadge, Achievements
67. → CommandPalette, ConfettiEffect
68. → Toutes les Pages
69. → App.tsx (routing complet)
70. → main.tsx

---

## RÈGLES ABSOLUES POUR CLAUDE CODE

1. **NE JAMAIS** mettre l'URI MongoDB en dur dans le code — toujours `process.env.MONGODB_URI`
2. **NE JAMAIS** stocker le JWT access token dans localStorage — uniquement Zustand en mémoire
3. **NE JAMAIS** utiliser `react-beautiful-dnd` — utiliser `@dnd-kit` uniquement
4. **NE JAMAIS** créer des fichiers de plus de 300 lignes — découper en sous-composants
5. **TOUJOURS** typer avec TypeScript strict (no `any` sauf cas exceptionnels commentés)
6. **TOUJOURS** valider les données entrantes avec Zod côté serveur
7. **TOUJOURS** gérer les erreurs dans les controllers (try/catch → next(error))
8. **TOUJOURS** retourner des réponses API cohérentes : `{ success, data?, error?, message? }`
9. **TOUJOURS** protéger les routes `/api/tasks`, `/api/projects`, `/api/analytics` avec `authMiddleware`
10. **TOUJOURS** ajouter `optimisticConcurrency: true` sur le schéma Task (drag & drop concurrent)
11. **Chaque composant React** doit avoir ses props typées avec interface TypeScript
12. **Chaque store Zustand** doit avoir ses types définis séparément dans `/types/index.ts`

---

## FORMAT DES RÉPONSES API

```typescript
// Succès
res.status(200).json({ success: true, data: payload });
res.status(201).json({ success: true, data: payload, message: 'Créé avec succès' });

// Erreur client
res.status(400).json({ success: false, error: 'Validation failed', details: [...] });
res.status(401).json({ success: false, error: 'Non authentifié' });
res.status(404).json({ success: false, error: 'Ressource non trouvée' });

// Erreur serveur
res.status(500).json({ success: false, error: 'Erreur serveur interne' });
```

---

## POUR COMMENCER — PREMIÈRE COMMANDE

Une fois ce fichier CLAUDE.md ouvert dans Claude Code, tape :

```
Génère l'intégralité du projet TaskMaster Pro en suivant exactement le CLAUDE.md.
Commence par la Phase 1 : structure du projet + backend complet (fichiers 1 à 37).
```

Ensuite pour le frontend :
```
Continue avec la Phase 2 : génère tout le frontend React (fichiers 38 à 70).
```

---

*CLAUDE.md — TaskMaster Pro — Version 1.0 — Avril 2026*
*Stack : React 18 + Express 5 + MongoDB Atlas + Vercel + Railway*
