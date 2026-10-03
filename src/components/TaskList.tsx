import React from 'react';
import type { Task, Category, FilterStatus, SortOption } from '../types/task';
import { TaskCard } from './TaskCard';
import {
  Search,
  Plus,
  ArrowUpDown,
  Filter,
  CheckCircle,
  Inbox,
} from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  categories: Category[];
  statusFilter: FilterStatus;
  onStatusFilterChange: (status: FilterStatus) => void;
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
  selectedPriority: string;
  onPrioritySelect: (priority: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  onOpenNewTaskModal: () => void;
  totalTasksCount: number;
  pendingTasksCount: number;
  completedTasksCount: number;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  categories,
  statusFilter,
  onStatusFilterChange,
  selectedCategory,
  onCategorySelect,
  selectedPriority,
  onPrioritySelect,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  onToggleTask,
  onDeleteTask,
  onEditTask,
  onOpenNewTaskModal,
  totalTasksCount,
  pendingTasksCount,
  completedTasksCount,
}) => {
  const categoryMap = new Map<string, Category>(categories.map((c) => [c.id, c]));

  return (
    <div className="space-y-6">
      {/* Top Controls Bar: Search, Status Filters, Sort, and Add Button */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
        {/* Linha 1: Barra de Busca + Botão Nova Tarefa */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Input de Busca */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar tarefas por título ou descrição..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-slate-800 placeholder:text-slate-400 bg-slate-50/50"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Botão Principal: Nova Tarefa */}
          <button
            type="button"
            id="btn-nova-tarefa"
            onClick={onOpenNewTaskModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-sm font-bold shadow-md shadow-indigo-100 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nova Tarefa</span>
          </button>
        </div>

        {/* Linha 2: Filtros de Status ('Todas', 'Pendentes', 'Concluídas') e Ordenação */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0" role="tablist">
            <button
              type="button"
              id="filter-todas"
              onClick={() => onStatusFilterChange('todas')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'todas'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>Todas</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                statusFilter === 'todas' ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {totalTasksCount}
              </span>
            </button>

            <button
              type="button"
              id="filter-pendentes"
              onClick={() => onStatusFilterChange('pendentes')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'pendentes'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100/80 border border-amber-200/60'
              }`}
            >
              <span>Pendentes</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                statusFilter === 'pendentes' ? 'bg-amber-700 text-white' : 'bg-amber-100 text-amber-800'
              }`}>
                {pendingTasksCount}
              </span>
            </button>

            <button
              type="button"
              id="filter-concluidas"
              onClick={() => onStatusFilterChange('concluidas')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'concluidas'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80 border border-emerald-200/60'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Concluídas</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                statusFilter === 'concluidas' ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {completedTasksCount}
              </span>
            </button>
          </div>

          {/* Filtro de Prioridade e Ordenação */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Prioridade Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">Prioridade:</span>
              <select
                value={selectedPriority}
                onChange={(e) => onPrioritySelect(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="todas">Todas Prioridades</option>
                <option value="ALTA">Alta Prioridade</option>
                <option value="MÉDIA">Média Prioridade</option>
                <option value="BAIXA">Baixa Prioridade</option>
              </select>
            </div>

            {/* Ordenação Selector */}
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="dueDateAsc">Data: Mais Próximas</option>
                <option value="dueDateDesc">Data: Mais Distantes</option>
                <option value="priorityDesc">Prioridade: Alta &gt; Baixa</option>
                <option value="createdAtDesc">Mais Recentes</option>
                <option value="titleAsc">Alfabética (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Linha 3: Filtro por Categorias (Chips) */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Categorias:
          </span>

          <button
            type="button"
            onClick={() => onCategorySelect('todas')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
              selectedCategory === 'todas'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todas
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onCategorySelect(cat.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 border ${
                  isSelected
                    ? `${cat.color.bg} ${cat.color.text} ${cat.color.border} ring-2 ring-indigo-400 font-extrabold shadow-xs`
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${cat.color.dot}`}></span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista de Tarefas Renderizada */}
      {tasks.length > 0 ? (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              category={categoryMap.get(task.categoryId)}
              onToggle={onToggleTask}
              onDelete={onDeleteTask}
              onEdit={onEditTask}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl p-10 border border-dashed border-slate-300 text-center flex flex-col items-center justify-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Nenhuma tarefa encontrada</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1 mb-5">
            {searchQuery || selectedCategory !== 'todas' || statusFilter !== 'todas'
              ? 'Tente ajustar os filtros ou os termos da sua busca para encontrar o que procura.'
              : 'Você não possui tarefas pendentes nesta categoria. Aproveite para relaxar ou adicione uma nova tarefa!'}
          </p>
          <button
            type="button"
            onClick={onOpenNewTaskModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Criar Nova Tarefa</span>
          </button>
        </div>
      )}
    </div>
  );
};
