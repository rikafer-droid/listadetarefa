export type Priority = 'ALTA' | 'MÉDIA' | 'BAIXA';

export interface Category {
  id: string;
  name: string;
  color: {
    bg: string;
    text: string;
    border: string;
    badgeBg: string;
    badgeText: string;
    dot: string;
  };
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  categoryId: string;
  priority: Priority;
  dueDate: string; // Formato YYYY-MM-DD
  createdAt: string; // ISO String
  completedAt?: string | null;
}

export type FilterStatus = 'todas' | 'pendentes' | 'concluidas';

export type SortOption = 'dueDateAsc' | 'dueDateDesc' | 'priorityDesc' | 'createdAtDesc' | 'titleAsc';

export type ViewTab = 'tarefas' | 'analises' | 'calendario';

export interface ToastNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
  undoAction?: () => void;
}
