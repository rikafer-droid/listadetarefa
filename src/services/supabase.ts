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
      detectSessionInUrl: true,
    },
  }
);

export interface DbTask {
  id: string;
  user_id?: string | null;
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
  user_id?: string | null;
  name: string;
  color: Category['color'];
  created_at?: string;
}

export function dbTaskToTask(db: DbTask): Task {
  return {
    id: db.id,
    userId: db.user_id || undefined,
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

export function taskToDbTask(task: Partial<Task>, userId?: string): Partial<DbTask> {
  const db: Partial<DbTask> = {};
  if (task.id !== undefined) db.id = task.id;
  if (userId || task.userId) db.user_id = userId || task.userId;
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

export function categoryToDbCategory(category: Category, userId?: string): DbCategory {
  const result: DbCategory = {
    id: category.id,
    name: category.name,
    color: category.color,
  };
  if (userId) {
    result.user_id = userId;
  }
  return result;
}

export const supabaseService = {
  // Buscar tarefas de um usuário específico
  async getTasks(userId?: string): Promise<Task[]> {
    let query = supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar tarefas do Supabase:', error);
      throw error;
    }

    return (data as DbTask[]).map(dbTaskToTask);
  },

  // Criar tarefa vinculada ao usuário
  async createTask(task: Task, userId?: string): Promise<Task> {
    const dbPayload = taskToDbTask(task, userId);
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
  async updateTask(id: string, updates: Partial<Task>, userId?: string): Promise<Task> {
    const dbPayload = taskToDbTask(updates, userId);
    let query = supabase
      .from('tasks')
      .update(dbPayload)
      .eq('id', id);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.select().single();

    if (error) {
      console.error('Erro ao atualizar tarefa no Supabase:', error);
      throw error;
    }

    return dbTaskToTask(data as DbTask);
  },

  // Excluir tarefa
  async deleteTask(id: string, userId?: string): Promise<void> {
    let query = supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { error } = await query;

    if (error) {
      console.error('Erro ao excluir tarefa do Supabase:', error);
      throw error;
    }
  },

  // Buscar categorias (globais ou do usuário)
  async getCategories(userId?: string): Promise<Category[]> {
    let query = supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });

    if (userId) {
      query = query.or(`user_id.is.null,user_id.eq.${userId}`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar categorias do Supabase:', error);
      throw error;
    }

    return (data as DbCategory[]).map(dbCategoryToCategory);
  },

  // Criar categoria
  async createCategory(category: Category, userId?: string): Promise<Category> {
    const dbPayload = categoryToDbCategory(category, userId);
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

  // Resetar dados para o usuário atual
  async resetData(tasks: Task[], _categories: Category[], userId?: string): Promise<void> {
    // Limpar tarefas do usuário
    if (userId) {
      await supabase.from('tasks').delete().eq('user_id', userId);
    } else {
      await supabase.from('tasks').delete().neq('id', 'placeholder');
    }

    // Inserir tarefas
    const taskPayload = tasks.map((t) => taskToDbTask(t, userId));
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
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Tabela de Perfis
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Tabela de Tarefas por Usuário
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  priority TEXT NOT NULL DEFAULT 'MÉDIA' CHECK (priority IN ('ALTA', 'MÉDIA', 'BAIXA')),
  due_date TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
`;
