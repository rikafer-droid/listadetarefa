import React, { useState } from 'react';
import type { Task, Category } from '../types/task';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  CheckCircle2,
  X,
  Trash2,
  Edit3,
} from 'lucide-react';
import {
  format,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CalendarViewProps {
  tasks: Task[];
  categories: Category[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  onOpenNewTaskForDate: (dateStr: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  categories,
  onToggleTask,
  onDeleteTask,
  onEditTask,
  onOpenNewTaskForDate,
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  // Gerar dias para a visualização do calendário
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Domingo
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

  const getTasksForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return tasks.filter((t) => t.dueDate === dateStr);
  };

  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
    setIsDayModalOpen(true);
  };

  const selectedDateTasks = getTasksForDate(selectedDate);
  const selectedDateFormatted = format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Calendar Header Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </h2>
            <p className="text-xs text-slate-500">Visualize prazos e organize seu cronograma</p>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentMonth(new Date())}
            className="px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Mês Atual
          </button>
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/60">
            <button
              type="button"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              aria-label="Mês anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              aria-label="Próximo mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-slate-200/80 bg-slate-50/75 text-center text-[11px] font-extrabold text-slate-500 py-3">
          {weekDays.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Day Cells Grid */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100">
          {calendarDays.map((day) => {
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentMonthDay = isSameMonth(day, currentMonth);
            const isCurrentDay = isToday(day);
            const dayTasks = getTasksForDate(day);

            return (
              <div
                key={day.toISOString()}
                onClick={() => handleDateClick(day)}
                className={`min-h-[100px] sm:min-h-[120px] p-2 sm:p-2.5 transition-colors cursor-pointer flex flex-col justify-between ${
                  !isCurrentMonthDay ? 'bg-slate-50/40 text-slate-300' : 'bg-white hover:bg-slate-50/80'
                } ${isSelected ? 'ring-2 ring-indigo-500 ring-inset z-10' : ''}`}
              >
                {/* Day number & today badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`w-6 h-6 flex items-center justify-center text-xs font-bold rounded-full ${
                      isCurrentDay
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : isCurrentMonthDay
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>

                  {dayTasks.length > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
                      {dayTasks.length}
                    </span>
                  )}
                </div>

                {/* Day tasks pill previews */}
                <div className="space-y-1 mt-1.5 flex-1 overflow-hidden">
                  {dayTasks.slice(0, 3).map((t) => {
                    const cat = categoryMap.get(t.categoryId);
                    return (
                      <div
                        key={t.id}
                        className={`text-[10px] px-1.5 py-0.5 rounded-md truncate font-medium flex items-center gap-1 ${
                          t.completed
                            ? 'bg-slate-100 text-slate-400 line-through'
                            : cat
                            ? `${cat.color.bg} ${cat.color.text} border border-transparent`
                            : 'bg-indigo-50 text-indigo-700'
                        }`}
                        title={t.title}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            t.completed ? 'bg-slate-300' : cat?.color.dot || 'bg-indigo-500'
                          }`}
                        />
                        <span className="truncate">{t.title}</span>
                      </div>
                    );
                  })}
                  {dayTasks.length > 3 && (
                    <div className="text-[10px] font-bold text-slate-400 pl-1">
                      +{dayTasks.length - 3} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Details Modal */}
      {isDayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden animate-modal-slide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 capitalize">
                  {selectedDateFormatted}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedDateTasks.length} tarefa{selectedDateTasks.length === 1 ? '' : 's'}{' '}
                  programada{selectedDateTasks.length === 1 ? '' : 's'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDayModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto space-y-3">
              {selectedDateTasks.length > 0 ? (
                selectedDateTasks.map((t) => {
                  const cat = categoryMap.get(t.categoryId);
                  return (
                    <div
                      key={t.id}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                        t.completed ? 'bg-slate-50 border-slate-200/60 opacity-70' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                          type="button"
                          onClick={() => onToggleTask(t.id)}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center cursor-pointer ${
                            t.completed
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'border-slate-300 hover:border-indigo-500'
                          }`}
                        >
                          {t.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            {cat && (
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${cat.color.badgeBg} ${cat.color.badgeText}`}
                              >
                                {cat.name}
                              </span>
                            )}
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-700">
                              {t.priority}
                            </span>
                          </div>
                          <p
                            className={`text-xs font-semibold text-slate-900 truncate ${
                              t.completed ? 'line-through text-slate-400' : ''
                            }`}
                          >
                            {t.title}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsDayModalOpen(false);
                            onEditTask(t);
                          }}
                          className="text-slate-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
                          title="Editar tarefa"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteTask(t.id);
                          }}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs">
                  Nenhuma tarefa agendada para este dia.
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setIsDayModalOpen(false);
                  onOpenNewTaskForDate(format(selectedDate, 'yyyy-MM-dd'));
                }}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Tarefa para este dia</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
