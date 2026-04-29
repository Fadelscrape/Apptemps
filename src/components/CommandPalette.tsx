'use client';

import { useEffect } from 'react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Home,
  Kanban,
  Calendar,
  BarChart3,
  Clock,
  Settings,
  Plus,
  FolderOpen,
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

type ViewType = 'dashboard' | 'kanban' | 'calendar' | 'analytics' | 'focus' | 'projects' | 'settings';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  setView: (view: ViewType) => void;
}

const NAVIGATION_COMMANDS = [
  { id: 'dashboard', label: "Aujourd'hui", icon: Home, view: 'dashboard' as ViewType },
  { id: 'kanban', label: 'Kanban', icon: Kanban, view: 'kanban' as ViewType },
  { id: 'calendar', label: 'Calendrier', icon: Calendar, view: 'calendar' as ViewType },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, view: 'analytics' as ViewType },
  { id: 'focus', label: 'Focus', icon: Clock, view: 'focus' as ViewType },
  { id: 'projects', label: 'Projets', icon: FolderOpen, view: 'projects' as ViewType },
  { id: 'settings', label: 'Paramètres', icon: Settings, view: 'settings' as ViewType },
];

export default function CommandPalette({ open, onClose, setView }: CommandPaletteProps) {
  const { setTaskModalOpen } = useUIStore();

  const navigate = (view: ViewType) => {
    setView(view);
    onClose();
  };

  const newTask = () => {
    setTaskModalOpen(true);
    onClose();
  };

  return (
    <CommandDialog open={open} onOpenChange={(v) => !v && onClose()} title="Palette de commandes">
      <CommandInput placeholder="Rechercher une commande..." />
      <CommandList>
        <CommandEmpty>Aucune commande trouvée.</CommandEmpty>

        <CommandGroup heading="Actions">
          <CommandItem onSelect={newTask}>
            <Plus />
            Nouvelle tâche
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navigation">
          {NAVIGATION_COMMANDS.map((cmd) => (
            <CommandItem key={cmd.id} onSelect={() => navigate(cmd.view)}>
              <cmd.icon />
              {cmd.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
