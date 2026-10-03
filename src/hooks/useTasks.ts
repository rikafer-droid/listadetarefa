import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { Task, Category, Priority, FilterStatus, SortOption, ToastNotification, ViewTab } from '../types/task';
import { storageService, DEFAULT_CATEGORIES, INITIAL_TASKS } from '../services/storage';
import { supabaseService, isSupabaseConfigured } from '../services/supabase';
import confetti from 'canvas-confetti';
import { parseISO, startOfDay } from 'date-fns';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => storageService.getTasks());
  const [categories, setCategories] = useState<Category[]>(() => storageService.getCategories());
  const [currentTab, setCurrentTab] = useState<ViewTab>('tarefas');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isSupabaseOnline, setIsSupabaseOnline] = useState<boolean>(isSupabaseConfigured);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  // Filtros e busca
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('todas');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [selectedPriority, setSelectedPriority] = useState<string>('todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('dueDateAsc');

  // Toasts
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Referência para evitar loop de sincronização
  const isInternalUpdate = useRef(false);

  // Função para disparar Toasts
  const addToast = useCallback((toast: Omit<ToastNotification, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastNotification = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Disparo de celebração de confetes
  const triggerConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
      });
    } catch {
      // Confetti fallback silencioso
    }
  }, []);

  // Carregar dados iniciais do Supabase
  const loadSupabaseData = useCallback(async (isInitial = false) => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    try {
      if (isInitial) setIsLoading(true);
      setIsSyncing(true);

      const [remoteCategories, remoteTasks] = await Promise.all([
        supabaseService.getCategories(),
        supabaseService.getTasks(),
      ]);

      // Se o banco estiver vazio pela primeira vez, faz o seed inicial
      if (remoteCategories.length === 0 && remoteTasks.length === 0) {
        await supabaseService.resetData(INITIAL_TASKS, DEFAULT_CATEGORIES);
        setCategories(DEFAULT_CATEGORIES);
        setTasks(INITIAL_TASKS);
        storageService.saveCategories(DEFAULT_CATEGORIES);
        storageService.saveTasks(INITIAL_TASKS);
      } else {
        if (remoteCategories.length > 0) {
          setCategories(remoteCategories);
          storageService.saveCategories(remoteCategories);
        }
        setTasks(remoteTasks);
        storageService.saveTasks(remoteTasks);
      }

      setIsSupabaseOnline(true);
      setLastSyncedAt(new Date());
    } catch (error) {
      console.warn('Supabase offline ou inacessível, utilizando cache local:', error);
      setIsSupabaseOnline(false);
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, []);

  // Efeito de inicialização e Realtime Subscription
  useEffect(() => {
    loadSupabaseData(true);

    if (isSupabaseConfigured) {
      const unsubscribe = supabaseService.subscribeTasks(() => {
        if (!isInternalUpdate.current) {
          loadSupabaseData(false);
        }
      });
      return () => {
        unsubscribe();
      };
    }
  }, [loadSupabaseData]);

  // Sincronização de backup local
  useEffect(() => {
    storageService.saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    storageService.saveCategories(categories);
  }, [categories]);

  // Operações CRUD com sincronização Supabase
  const addTask = useCallback(
    async (taskData: {
      title: string;
      description?: string;
      categoryId: string;
      priority: Priority;
      dueDate: string;
    }) => {
      const tempId = 'task-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
      const newTask: Task = {
        id: tempId,
        title: taskData.title.trim(),
        description: taskData.description?.trim() || undefined,
        completed: false,
        categoryId: taskData.categoryId,
        priority: taskData.priority,
        dueDate: taskData.dueDate,
        createdAt: new Date().toISOString(),
      };

      // Atualização otimista
      setTasks((prev) => [newTask, ...prev]);

      addToast({
        type: 'success',
        title: 'Tarefa criada!',
        message: `"${newTask.title}" salva no Supabase.`,
      });

      if (isSupabaseConfigured) {
        try {
          isInternalUpdate.current = true;
          setIsSyncing(true);
          const savedTask = await supabaseService.createTask(newTask);
          // Atualiza com os dados persistidos do Supabase
          setTasks((prev) => prev.map((t) => (t.id === tempId ? savedTask : t)));
          setLastSyncedAt(new Date());
          setIsSupabaseOnline(true);
        } catch (err) {
          console.error('Falha ao sincronizar criação no Supabase:', err);
          setIsSupabaseOnline(false);
          addToast({
            type: 'warning',
            title: 'Salvo localmente',
            message: 'Erro na nuvem, a tarefa foi salva no cache local.',
          });
        } finally {
          setIsSyncing(false);
          setTimeout(() => {
            isInternalUpdate.current = false;
          }, 500);
        }
      }
    },
    [addToast]
  );

  const updateTask = useCallback(
    async (id: string, updatedFields: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
      const isMarkingCompleted = updatedFields.completed === true;

      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === id) {
            return {
              ...t,
              ...updatedFields,
              completedAt: isMarkingCompleted
                ? new Date().toISOString()
                : updatedFields.completed === false
                ? null
                : t.completedAt,
            };
          }
          return t;
        })
      );

      addToast({
        type: 'info',
        title: 'Tarefa atualizada!',
        message: 'Alterações sincronizadas com o Supabase.',
      });

      if (isSupabaseConfigured) {
        try {
          isInternalUpdate.current = true;
          setIsSyncing(true);
          await supabaseService.updateTask(id, {
            ...updatedFields,
            completedAt: isMarkingCompleted ? new Date().toISOString() : updatedFields.completed === false ? null : undefined,
          });
          setLastSyncedAt(new Date());
          setIsSupabaseOnline(true);
        } catch (err) {
          console.error('Falha ao atualizar no Supabase:', err);
          setIsSupabaseOnline(false);
        } finally {
          setIsSyncing(false);
          setTimeout(() => {
            isInternalUpdate.current = false;
          }, 500);
        }
      }
    },
    [addToast]
  );

  const toggleTask = useCallback(
    async (id: string) => {
      let justCompleted = false;
      let taskTitle = '';
      let nextState = false;

      setTasks((prev) => {
        const updated = prev.map((t) => {
          if (t.id === id) {
            nextState = !t.completed;
            justCompleted = nextState;
            taskTitle = t.title;
            return {
              ...t,
              completed: nextState,
              completedAt: nextState ? new Date().toISOString() : null,
            };
          }
          return t;
        });

        if (justCompleted) {
          triggerConfetti();
        }

        return updated;
      });

      if (justCompleted) {
        addToast({
          type: 'success',
          title: 'Tarefa concluída! 🎉',
          message: `Parabéns por finalizar "${taskTitle}"`,
        });
      }

      if (isSupabaseConfigured) {
        try {
          isInternalUpdate.current = true;
          setIsSyncing(true);
          await supabaseService.updateTask(id, {
            completed: nextState,
            completedAt: nextState ? new Date().toISOString() : null,
          });
          setLastSyncedAt(new Date());
          setIsSupabaseOnline(true);
        } catch (err) {
          console.error('Falha ao alternar tarefa no Supabase:', err);
          setIsSupabaseOnline(false);
        } finally {
          setIsSyncing(false);
          setTimeout(() => {
            isInternalUpdate.current = false;
          }, 500);
        }
      }
    },
    [triggerConfetti, addToast]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      const taskToDelete = tasks.find((t) => t.id === id);
      if (!taskToDelete) return;

      // Remoção otimista
      setTasks((prev) => prev.filter((t) => t.id !== id));

      addToast({
        type: 'warning',
        title: 'Tarefa removida',
        message: `"${taskToDelete.title}" foi excluída do Supabase.`,
        undoAction: async () => {
          setTasks((prev) => [taskToDelete, ...prev]);
          if (isSupabaseConfigured) {
            try {
              await supabaseService.createTask(taskToDelete);
            } catch (err) {
              console.error('Erro ao restaurar tarefa no Supabase:', err);
            }
          }
          addToast({
            type: 'info',
            title: 'Ação desfeita',
            message: `"${taskToDelete.title}" foi restaurada.`,
          });
        },
      });

      if (isSupabaseConfigured) {
        try {
          isInternalUpdate.current = true;
          setIsSyncing(true);
          await supabaseService.deleteTask(id);
          setLastSyncedAt(new Date());
          setIsSupabaseOnline(true);
        } catch (err) {
          console.error('Falha ao excluir no Supabase:', err);
          setIsSupabaseOnline(false);
        } finally {
          setIsSyncing(false);
          setTimeout(() => {
            isInternalUpdate.current = false;
          }, 500);
        }
      }
    },
    [tasks, addToast]
  );

  const addCategory = useCallback(
    async (category: Category) => {
      setCategories((prev) => [...prev, category]);
      addToast({
        type: 'success',
        title: 'Nova Categoria!',
        message: `Categoria "${category.name}" adicionada.`,
      });

      if (isSupabaseConfigured) {
        try {
          isInternalUpdate.current = true;
          setIsSyncing(true);
          await supabaseService.createCategory(category);
          setLastSyncedAt(new Date());
          setIsSupabaseOnline(true);
        } catch (err) {
          console.error('Erro ao salvar categoria no Supabase:', err);
          setIsSupabaseOnline(false);
        } finally {
          setIsSyncing(false);
          setTimeout(() => {
            isInternalUpdate.current = false;
          }, 500);
        }
      }
    },
    [addToast]
  );

  const resetAllData = useCallback(async () => {
    setIsSyncing(true);
    const reset = storageService.resetToDefault();
    setTasks(reset.tasks);
    setCategories(reset.categories);

    if (isSupabaseConfigured) {
      try {
        await supabaseService.resetData(reset.tasks, reset.categories);
        setIsSupabaseOnline(true);
        setLastSyncedAt(new Date());
      } catch (err) {
        console.error('Erro ao resetar no Supabase:', err);
      }
    }

    setIsSyncing(false);
    addToast({
      type: 'info',
      title: 'Dados restaurados',
      message: 'A lista de tarefas e categorias padrão foi sincronizada com o Supabase.',
    });
  }, [addToast]);

  // Lista filtrada e ordenada
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (statusFilter === 'pendentes' && task.completed) return false;
        if (statusFilter === 'concluidas' && !task.completed) return false;
        if (selectedCategory !== 'todas' && task.categoryId !== selectedCategory) return false;
        if (selectedPriority !== 'todas' && task.priority !== selectedPriority) return false;

        if (searchQuery.trim() !== '') {
          const query = searchQuery.toLowerCase();
          const matchesTitle = task.title.toLowerCase().includes(query);
          const matchesDesc = task.description?.toLowerCase().includes(query) ?? false;
          if (!matchesTitle && !matchesDesc) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const priorityWeight: Record<Priority, number> = { ALTA: 3, MÉDIA: 2, BAIXA: 1 };

        switch (sortBy) {
          case 'dueDateAsc':
            return a.dueDate.localeCompare(b.dueDate);
          case 'dueDateDesc':
            return b.dueDate.localeCompare(a.dueDate);
          case 'priorityDesc':
            return priorityWeight[b.priority] - priorityWeight[a.priority];
          case 'createdAtDesc':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'titleAsc':
            return a.title.localeCompare(b.title);
          default:
            return 0;
        }
      });
  }, [tasks, statusFilter, selectedCategory, selectedPriority, searchQuery, sortBy]);

  // Estatísticas calculadas
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const todayDate = startOfDay(new Date());

    let overdueCount = 0;
    let dueTodayCount = 0;
    let futureCount = 0;

    tasks.forEach((t) => {
      if (!t.completed) {
        const taskDate = startOfDay(parseISO(t.dueDate));
        if (taskDate.getTime() < todayDate.getTime()) {
          overdueCount++;
        } else if (taskDate.getTime() === todayDate.getTime()) {
          dueTodayCount++;
        } else {
          futureCount++;
        }
      }
    });

    const priorityCounts: Record<Priority, { total: number; completed: number }> = {
      ALTA: { total: 0, completed: 0 },
      MÉDIA: { total: 0, completed: 0 },
      BAIXA: { total: 0, completed: 0 },
    };

    const categoryCounts: Record<string, { total: number; completed: number }> = {};

    categories.forEach((cat) => {
      categoryCounts[cat.id] = { total: 0, completed: 0 };
    });

    tasks.forEach((t) => {
      if (priorityCounts[t.priority]) {
        priorityCounts[t.priority].total++;
        if (t.completed) priorityCounts[t.priority].completed++;
      }

      if (!categoryCounts[t.categoryId]) {
        categoryCounts[t.categoryId] = { total: 0, completed: 0 };
      }
      categoryCounts[t.categoryId].total++;
      if (t.completed) categoryCounts[t.categoryId].completed++;
    });

    return {
      total,
      completed,
      pending,
      completionRate,
      overdueCount,
      dueTodayCount,
      futureCount,
      priorityCounts,
      categoryCounts,
    };
  }, [tasks, categories]);

  return {
    tasks,
    categories,
    currentTab,
    setCurrentTab,
    statusFilter,
    setStatusFilter,
    selectedCategory,
    setSelectedCategory,
    selectedPriority,
    setSelectedPriority,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    filteredTasks,
    stats,
    toasts,
    removeToast,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    addCategory,
    resetAllData,
    triggerConfetti,
    isLoading,
    isSyncing,
    isSupabaseOnline,
    lastSyncedAt,
    refreshData: () => loadSupabaseData(false),
  };
}
