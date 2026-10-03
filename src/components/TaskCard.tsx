import React, { useState } from 'react';
import type { Task, Category, Priority } from '../types/task';
import { Calendar, Trash2, Edit3, Check, ChevronDown, ChevronUp, AlertCircle, Clock } from 'lucide-react';
import { format, parseISO, isToday, isTomorrow, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TaskCardProps {
  task: Task;
  category?: Category;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  category,
  onToggle,
  onDelete,
  onEdit,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Formatação amigável da data de vencimento
  const taskDate = startOfDay(parseISO(task.dueDate));
  const today = startOfDay(new Date());
  const isOverdue = !task.completed && taskDate.getTime() < today.getTime();
  const isDueToday = !task.completed && isToday(taskDate);
  const isDueTomorrow = !task.completed && isTomorrow(taskDate);

  const formattedDate = format(taskDate, "dd 'de' MMM", { locale: ptBR });

  // Configurações visuais de Prioridade
  const priorityConfig: Record<
    Priority,
    { badgeBg: string; badgeText: string; border: string; dot: string; label: string }
  > = {
    ALTA: {
      badgeBg: 'bg-rose-50',
      badgeText: 'text-rose-700',
      border: 'border-rose-200',
      dot: 'bg-rose-500',
      label: 'ALTA',
    },
    MÉDIA: {
      badgeBg: 'bg-amber-50',
      badgeText: 'text-amber-700',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
      label: 'MÉDIA',
    },
    BAIXA: {
      badgeBg: 'bg-emerald-50',
      badgeText: 'text-emerald-700',
      border: 'border-emerald-200',
      dot: 'bg-emerald-500',
      label: 'BAIXA',
    },
  };

  const priorityStyle = priorityConfig[task.priority] || priorityConfig['MÉDIA'];

  // Categoria fallback caso não encontre
  const categoryName = category ? category.name.toUpperCase() : 'GERAL';
  const categoryColor = category
    ? category.color
    : {
        badgeBg: 'bg-slate-100',
        badgeText: 'text-slate-800',
        border: 'border-slate-200',
        dot: 'bg-slate-400',
      };

  return (
    <div
      className={`group relative bg-white rounded-2xl border transition-all duration-200 p-4 sm:p-5 ${
        task.completed
          ? 'border-slate-200/60 bg-slate-50/70 opacity-65 hover:opacity-90'
          : 'border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300'
      }`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Custom Animated Checkbox no lado esquerdo */}
        <button
          type="button"
          onClick={() => onToggle(task.id)}
          aria-label={task.completed ? 'Desmarcar tarefa' : 'Marcar tarefa como concluída'}
          className={`shrink-0 mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 cursor-pointer ${
            task.completed
              ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
              : 'border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/40 bg-white'
          }`}
        >
          {task.completed && <Check className="w-4 h-4 stroke-[3] animate-check-pop" />}
        </button>

        {/* Conteúdo Central da Tarefa */}
        <div className="flex-1 min-w-0">
          {/* Tags coloridas: Categoria e Prioridade */}
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            {/* Tag de Categoria */}
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase border ${categoryColor.badgeBg} ${categoryColor.badgeText} ${categoryColor.border}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${categoryColor.dot}`}></span>
              {categoryName}
            </span>

            {/* Tag de Prioridade */}
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase border ${priorityStyle.badgeBg} ${priorityStyle.badgeText} ${priorityStyle.border}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${priorityStyle.dot}`}></span>
              {priorityStyle.label}
            </span>

            {/* Alerta de data especial (Atrasada / Hoje) */}
            {isOverdue && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                <AlertCircle className="w-3 h-3" /> Atrasada
              </span>
            )}
            {isDueToday && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                <Clock className="w-3 h-3" /> Vence Hoje
              </span>
            )}
            {isDueTomorrow && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                Amanhã
              </span>
            )}
          </div>

          {/* Título da tarefa em destaque */}
          <h3
            onClick={() => onToggle(task.id)}
            className={`text-base font-semibold tracking-tight cursor-pointer select-none transition-colors ${
              task.completed
                ? 'line-through text-slate-400'
                : 'text-slate-900 group-hover:text-indigo-950'
            }`}
          >
            {task.title}
          </h3>

          {/* Descrição opcional */}
          {task.description && (
            <div className="mt-1">
              <p
                className={`text-xs leading-relaxed text-slate-500 ${
                  isExpanded ? 'block' : 'line-clamp-2'
                } ${task.completed ? 'line-through opacity-75' : ''}`}
              >
                {task.description}
              </p>
              {task.description.length > 90 && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-0.5 mt-0.5 cursor-pointer"
                >
                  {isExpanded ? (
                    <>
                      Menos <ChevronUp className="w-3 h-3" />
                    </>
                  ) : (
                    <>
                      Mais detalhes <ChevronDown className="w-3 h-3" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Rodapé do Card: Data com ícone de calendário */}
          <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
            <div
              className={`flex items-center gap-1.5 font-medium ${
                isOverdue
                  ? 'text-rose-600 font-semibold'
                  : isDueToday
                  ? 'text-amber-700 font-semibold'
                  : 'text-slate-500'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Ações no canto direito: Editar e Lixeira */}
        <div className="flex items-center gap-1 sm:gap-1.5 opacity-90 sm:opacity-75 sm:group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
            title="Editar tarefa"
            aria-label="Editar tarefa"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(task.id)}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            title="Excluir tarefa"
            aria-label="Excluir tarefa"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
