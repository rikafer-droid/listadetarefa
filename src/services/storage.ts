import type { Category, Task } from '../types/task';
import { format, addDays, subDays } from 'date-fns';

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'trabalho',
    name: 'TRABALHO',
    color: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
      badgeBg: 'bg-indigo-100',
      badgeText: 'text-indigo-800',
      dot: 'bg-indigo-500',
    },
  },
  {
    id: 'pessoal',
    name: 'PESSOAL',
    color: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-800',
      dot: 'bg-emerald-500',
    },
  },
  {
    id: 'estudos',
    name: 'ESTUDOS',
    color: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
      badgeBg: 'bg-purple-100',
      badgeText: 'text-purple-800',
      dot: 'bg-purple-500',
    },
  },
  {
    id: 'financas',
    name: 'FINANÇAS',
    color: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-800',
      dot: 'bg-amber-500',
    },
  },
  {
    id: 'saude',
    name: 'SAÚDE',
    color: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      badgeBg: 'bg-rose-100',
      badgeText: 'text-rose-800',
      dot: 'bg-rose-500',
    },
  },
];

const today = new Date();

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Finalizar relatório executivo do projeto Q3',
    description: 'Consolidar métricas de desempenho e enviar para a diretoria financeira.',
    completed: false,
    categoryId: 'trabalho',
    priority: 'ALTA',
    dueDate: format(today, 'yyyy-MM-dd'),
    createdAt: subDays(today, 2).toISOString(),
  },
  {
    id: 'task-2',
    title: 'Estudar conceitos de React 19 e Hooks avançados',
    description: 'Revisar useActionState, Server Actions e novos padrões de performance.',
    completed: false,
    categoryId: 'estudos',
    priority: 'MÉDIA',
    dueDate: format(addDays(today, 1), 'yyyy-MM-dd'),
    createdAt: subDays(today, 1).toISOString(),
  },
  {
    id: 'task-3',
    title: 'Revisar planejamento orçamentário do mês',
    description: 'Organizar planilhas de despesas fixas e aportes em investimentos.',
    completed: true,
    categoryId: 'financas',
    priority: 'ALTA',
    dueDate: format(subDays(today, 1), 'yyyy-MM-dd'),
    createdAt: subDays(today, 4).toISOString(),
    completedAt: subDays(today, 1).toISOString(),
  },
  {
    id: 'task-4',
    title: 'Treino funcional e caminhada ao ar livre',
    description: '45 minutos de exercícios aeróbicos e alongamento.',
    completed: false,
    categoryId: 'saude',
    priority: 'BAIXA',
    dueDate: format(today, 'yyyy-MM-dd'),
    createdAt: subDays(today, 1).toISOString(),
  },
  {
    id: 'task-5',
    title: 'Comprar presentes de aniversário da família',
    description: 'Pesquisar opções de presentes e agendar entrega com antecedência.',
    completed: false,
    categoryId: 'pessoal',
    priority: 'MÉDIA',
    dueDate: format(addDays(today, 3), 'yyyy-MM-dd'),
    createdAt: subDays(today, 3).toISOString(),
  },
  {
    id: 'task-6',
    title: 'Alinhamento com a equipe de Design System',
    description: 'Definir paleta de cores acessível e tokens de espaçamento para a nova versão.',
    completed: true,
    categoryId: 'trabalho',
    priority: 'MÉDIA',
    dueDate: format(subDays(today, 2), 'yyyy-MM-dd'),
    createdAt: subDays(today, 5).toISOString(),
    completedAt: subDays(today, 2).toISOString(),
  },
];

const STORAGE_KEYS = {
  TASKS: 'taskflow_tasks_v1',
  CATEGORIES: 'taskflow_categories_v1',
};

export const storageService = {
  getTasks: (): Task[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(INITIAL_TASKS));
        return INITIAL_TASKS;
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Erro ao ler tarefas do localStorage:', error);
      return INITIAL_TASKS;
    }
  },

  saveTasks: (tasks: Task[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (error) {
      console.error('Erro ao salvar tarefas no localStorage:', error);
    }
  },

  getCategories: (): Category[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
        return DEFAULT_CATEGORIES;
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Erro ao ler categorias do localStorage:', error);
      return DEFAULT_CATEGORIES;
    }
  },

  saveCategories: (categories: Category[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (error) {
      console.error('Erro ao salvar categorias no localStorage:', error);
    }
  },

  exportDataJson: (): string => {
    const tasks = storageService.getTasks();
    const categories = storageService.getCategories();
    return JSON.stringify({ tasks, categories, exportedAt: new Date().toISOString() }, null, 2);
  },

  resetToDefault: (): { tasks: Task[]; categories: Category[] } => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(INITIAL_TASKS));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    return { tasks: INITIAL_TASKS, categories: DEFAULT_CATEGORIES };
  },
};
