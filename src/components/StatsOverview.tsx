import React from 'react';
import { CheckCircle2, Clock, ListTodo, TrendingUp, AlertCircle } from 'lucide-react';

interface StatsOverviewProps {
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
  overdueCount: number;
  dueTodayCount: number;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  total,
  completed,
  pending,
  completionRate,
  overdueCount,
  dueTodayCount,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total de Tarefas</span>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ListTodo className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{total}</span>
          <span className="text-xs font-medium text-slate-500">cadastradas</span>
        </div>
        <div className="mt-3 text-xs text-slate-500 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
          <span>Visão geral de todas as tarefas</span>
        </div>
      </div>

      {/* Pendentes Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pendentes</span>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{pending}</span>
          <span className="text-xs font-medium text-slate-500">em andamento</span>
        </div>
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          {overdueCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
              <AlertCircle className="w-3 h-3 text-rose-500" /> {overdueCount} atrasada{overdueCount > 1 ? 's' : ''}
            </span>
          )}
          {dueTodayCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
              <Clock className="w-3 h-3 text-amber-500" /> {dueTodayCount} para hoje
            </span>
          )}
          {overdueCount === 0 && dueTodayCount === 0 && (
            <span className="text-xs text-slate-500">Tudo sob controle</span>
          )}
        </div>
      </div>

      {/* Concluídas Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Concluídas</span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{completed}</span>
          <span className="text-xs font-medium text-emerald-600 font-semibold">tarefas finalizadas</span>
        </div>
        <div className="mt-3 text-xs text-slate-500 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Produtividade em ação</span>
        </div>
      </div>

      {/* Taxa de Conclusão Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Taxa de Conclusão</span>
          <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{completionRate}%</span>
          <span className="text-xs font-medium text-slate-500">progresso geral</span>
        </div>
        <div className="mt-3">
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};
