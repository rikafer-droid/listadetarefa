import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useTasks } from './hooks/useTasks';
import { Navbar } from './components/Navbar';
import { StatsOverview } from './components/StatsOverview';
import { TaskList } from './components/TaskList';
import { AnalyticsView } from './components/AnalyticsView';
import { CalendarView } from './components/CalendarView';
import { TaskModal } from './components/TaskModal';
import { LogoutModal } from './components/LogoutModal';
import { UserProfileModal } from './components/UserProfileModal';
import { SupabaseModal } from './components/SupabaseModal';
import { AuthScreen } from './components/AuthScreen';
import { ToastContainer } from './components/ToastContainer';
import type { Task, Priority } from './types/task';
import { Heart, CloudCheck, RefreshCw, Sparkles, CheckSquare } from 'lucide-react';

function MainApp() {
  const { user, profile, isLoading: authLoading, isPasswordRecovery } = useAuth();
  
  const {
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
    isLoading: tasksLoading,
    isSyncing,
    isSupabaseOnline,
    lastSyncedAt,
    refreshData,
  } = useTasks(user?.id);

  // Modais
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Tela de Carregamento de Autenticação Inicial
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/25">
            <CheckSquare className="w-8 h-8 stroke-[2.5]" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-black text-white">TaskFlow</h2>
            <p className="text-xs text-indigo-300">Carregando autenticação...</p>
          </div>
          <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin mt-2" />
        </div>
      </div>
    );
  }

  // Se não estiver autenticado ou em modo de recuperação de senha, exibe a tela de login/cadastro
  if (!user || isPasswordRecovery) {
    return <AuthScreen />;
  }

  // Abrir modal de criação
  const handleOpenNewTask = () => {
    setTaskToEdit(null);
    setIsTaskModalOpen(true);
  };

  // Abrir modal de edição
  const handleOpenEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  // Abrir criação rápida para uma data específica (via Calendário)
  const handleOpenNewTaskForDate = (dateStr: string) => {
    setTaskToEdit({
      id: '',
      title: '',
      completed: false,
      categoryId: categories[0]?.id || 'trabalho',
      priority: 'MÉDIA',
      dueDate: dateStr,
      createdAt: new Date().toISOString(),
    });
    setIsTaskModalOpen(true);
  };

  // Salvar no Modal (criação ou edição)
  const handleSaveTask = (taskData: {
    title: string;
    description?: string;
    categoryId: string;
    priority: Priority;
    dueDate: string;
  }) => {
    if (taskToEdit && taskToEdit.id) {
      updateTask(taskToEdit.id, taskData);
    } else {
      addTask(taskData);
    }
  };

  const displayName = profile?.fullName || user.email?.split('@')[0] || 'Usuário';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Navbar com abas Tarefas, Análises, Calendário e Perfil */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        pendingCount={stats.pending}
        onOpenLogout={() => setIsLogoutModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        isSupabaseOnline={isSupabaseOnline}
        isSyncing={isSyncing}
      />

      {/* Barra de Status e Boas-vindas ao Usuário */}
      <div className="bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-800 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CloudCheck className="w-4 h-4 text-emerald-600" />
            <span>
              Conectado como <strong className="font-semibold text-emerald-950">{displayName}</strong> ({user.email})
            </span>
          </div>
          <div className="flex items-center gap-3">
            {isSyncing && (
              <span className="flex items-center gap-1 font-medium text-emerald-700">
                <RefreshCw className="w-3 h-3 animate-spin" /> Sincronizando...
              </span>
            )}
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
              <Sparkles className="w-3 h-3" /> Tarefas exclusivas do seu perfil
            </span>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {tasksLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-sm font-semibold text-slate-600">Sincronizando tarefas com o Supabase...</p>
          </div>
        ) : (
          <>
            {currentTab === 'tarefas' && (
              <div className="space-y-6">
                {/* Visão de Estatísticas / Cards */}
                <StatsOverview
                  total={stats.total}
                  completed={stats.completed}
                  pending={stats.pending}
                  completionRate={stats.completionRate}
                  overdueCount={stats.overdueCount}
                  dueTodayCount={stats.dueTodayCount}
                />

                {/* Lista Principal de Tarefas com Filtros e Ações */}
                <TaskList
                  tasks={filteredTasks}
                  categories={categories}
                  statusFilter={statusFilter}
                  onStatusFilterChange={setStatusFilter}
                  selectedCategory={selectedCategory}
                  onCategorySelect={setSelectedCategory}
                  selectedPriority={selectedPriority}
                  onPrioritySelect={setSelectedPriority}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  onToggleTask={toggleTask}
                  onDeleteTask={deleteTask}
                  onEditTask={handleOpenEditTask}
                  onOpenNewTaskModal={handleOpenNewTask}
                  totalTasksCount={stats.total}
                  pendingTasksCount={stats.pending}
                  completedTasksCount={stats.completed}
                />
              </div>
            )}

            {currentTab === 'analises' && (
              <AnalyticsView
                tasks={tasks}
                categories={categories}
                onGoToTasks={() => setCurrentTab('tarefas')}
              />
            )}

            {currentTab === 'calendario' && (
              <CalendarView
                tasks={tasks}
                categories={categories}
                onToggleTask={toggleTask}
                onDeleteTask={deleteTask}
                onEditTask={handleOpenEditTask}
                onOpenNewTaskForDate={handleOpenNewTaskForDate}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">TaskFlow</span>
            <span>—</span>
            <span>Lista de Tarefas & Gestão Produtiva</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsSupabaseModalOpen(true)}
              className="text-slate-600 hover:text-indigo-600 transition-colors font-medium cursor-pointer"
            >
              Supabase Status
            </button>
            <span>•</span>
            <span className="flex items-center gap-1">
              Desenvolvido com <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> para alta produtividade
            </span>
          </div>
        </div>
      </footer>

      {/* Modais Globais */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        categories={categories}
        onAddCategory={addCategory}
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onOpenLogoutModal={() => setIsLogoutModalOpen(true)}
        totalTasks={stats.total}
        completedTasks={stats.completed}
        pendingTasks={stats.pending}
      />

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onResetData={resetAllData}
        totalTasks={stats.total}
        completedTasks={stats.completed}
      />

      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        totalTasks={stats.total}
        totalCategories={categories.length}
        isOnline={isSupabaseOnline}
        lastSyncedAt={lastSyncedAt}
        onRefresh={refreshData}
      />

      {/* Notificações Toasts com Desfazer */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
