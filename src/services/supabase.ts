import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Task, Category, Priority } from '../types/task';

// Configuração e Credenciais obtidas exclusivamente via variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

export interface DbTask {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  category_id: string;
  priority: Priority;
  due_date: string;
  created_at: string;
  completed_at: string | null;
}

export interface DbCategory {
  id: string;
  name: string;
  color: Category['color'];
  created_at?: string;
}

export function dbTaskToTask(db: DbTask): Task {
  return {
    id: db.id,
    title: db.title,
    description: db.description || undefined,
    completed: db.completed,
    categoryId: db.category_id,
    priority: db.priority,
    dueDate: db.due_date,
    createdAt: db.created_at,
    completedAt: db.completed_at || undefined,
  };
}

export function taskToDbTask(task: Partial<Task>): Partial<DbTask> {
  const db: Partial<DbTask> = {};
  if (task.id !== undefined) db.id = task.id;
  if (task.title !== undefined) db.title = task.title;
  if (task.description !== undefined) db.description = task.description || null;
  if (task.completed !== undefined) db.completed = task.completed;
  if (task.categoryId !== undefined) db.category_id = task.categoryId;
  if (task.priority !== undefined) db.priority = task.priority;
  if (task.dueDate !== undefined) db.due_date = task.dueDate;
  if (task.createdAt !== undefined) db.created_at = task.createdAt;
  if (task.completedAt !== undefined) db.completed_at = task.completedAt || null;
  return db;
}

export function dbCategoryToCategory(db: DbCategory): Category {
  return {
    id: db.id,
    name: db.name,
    color: db.color,
  };
}

export function categoryToDbCategory(category: Category): DbCategory {
  return {
    id: category.id,
    name: category.name,
    color: category.color,
  };
}

export const supabaseService = {
  // Buscar tarefas
  async getTasks(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar tarefas do Supabase:', error);
      throw error;
    }

    return (data as DbTask[]).map(dbTaskToTask);
  },

  // Criar tarefa
  async createTask(task: Task): Promise<Task> {
    const dbPayload = taskToDbTask(task);
    const { data, error } = await supabase
      .from('tasks')
      .insert([dbPayload])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar tarefa no Supabase:', error);
      throw error;
    }

    return dbTaskToTask(data as DbTask);
  },

  // Atualizar tarefa
  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const dbPayload = taskToDbTask(updates);
    const { data, error } = await supabase
      .from('tasks')
      .update(dbPayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar tarefa no Supabase:', error);
      throw error;
    }

    return dbTaskToTask(data as DbTask);
  },

  // Excluir tarefa
  async deleteTask(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir tarefa do Supabase:', error);
      throw error;
    }
  },

  // Buscar categorias
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar categorias do Supabase:', error);
      throw error;
    }

    return (data as DbCategory[]).map(dbCategoryToCategory);
  },

  // Criar categoria
  async createCategory(category: Category): Promise<Category> {
    const dbPayload = categoryToDbCategory(category);
    const { data, error } = await supabase
      .from('categories')
      .insert([dbPayload])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar categoria no Supabase:', error);
      throw error;
    }

    return dbCategoryToCategory(data as DbCategory);
  },

  // Resetar dados (re-seed)
  async resetData(tasks: Task[], categories: Category[]): Promise<void> {
    // Limpar tabelas
    await supabase.from('tasks').delete().neq('id', 'placeholder');
    await supabase.from('categories').delete().neq('id', 'placeholder');

    // Inserir categorias
    const catPayload = categories.map(categoryToDbCategory);
    await supabase.from('categories').insert(catPayload);

    // Inserir tarefas
    const taskPayload = tasks.map((t) => taskToDbTask(t));
    await supabase.from('tasks').insert(taskPayload);
  },

  // Inscrição em tempo real (Realtime)
  subscribeTasks(onChange: () => void) {
    const channel = supabase
      .channel('tasks-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => {
          onChange();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};

export const SUPABASE_SCHEMA_SQL = `-- 1. Tabela de Categorias
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Tabela de Tarefas
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  priority TEXT NOT NULL DEFAULT 'MÉDIA' CHECK (priority IN ('ALTA', 'MÉDIA', 'BAIXA')),
  due_date TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Políticas RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir todas as operacoes de categorias para anon"
  ON public.categories FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Permitir todas as operacoes de tarefas para anon"
  ON public.tasks FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);
`;
