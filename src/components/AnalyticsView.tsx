import React from 'react';
import type { Task, Category, Priority } from '../types/task';
import {
  PieChart,
  BarChart2,
  CheckCircle2,
  AlertTriangle,
  Award,
  Zap,
  Flame,
  ArrowRight,
} from 'lucide-react';

interface AnalyticsViewProps {
  tasks: Task[];
  categories: Category[];
  onGoToTasks: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  tasks,
  categories,
  onGoToTasks,
}) => {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Distribuição por Categoria
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const categoryStats = categories.map((cat) => {
    const catTasks = tasks.filter((t) => t.categoryId === cat.id);
    const catCompleted = catTasks.filter((t) => t.completed).length;
    const catRate = catTasks.length > 0 ? Math.round((catCompleted / catTasks.length) * 100) : 0;
    return {
      category: cat,
      total: catTasks.length,
      completed: catCompleted,
      pending: catTasks.length - catCompleted,
      rate: catRate,
    };
  });

  // Distribuição por Prioridade
  const priorities: Priority[] = ['ALTA', 'MÉDIA', 'BAIXA'];
  const priorityStats = priorities.map((p) => {
    const pTasks = tasks.filter((t) => t.priority === p);
    const pCompleted = pTasks.filter((t) => t.completed).length;
    return {
      priority: p,
      total: pTasks.length,
      completed: pCompleted,
      pending: pTasks.length - pCompleted,
    };
  });

  // Tarefas prioritárias pendentes para foco
  const urgentPendingTasks = tasks.filter((t) => !t.completed && t.priority === 'ALTA').slice(0, 4);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner de Desempenho */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-950/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 border border-white/10">
            <Award className="w-3.5 h-3.5 text-amber-300" /> Relatório de Produtividade
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {rate >= 75
              ? 'Excelente ritmo de trabalho! 🔥'
              : rate >= 50
              ? 'Bom progresso! Continue avançando 🚀'
              : 'Foco no objetivo para concluir suas metas 💪'}
          </h2>
          <p className="text-sm text-indigo-200/90 max-w-xl">
            Você já concluiu <span className="font-bold text-white">{completed}</span> de um total de{' '}
            <span className="font-bold text-white">{total}</span> tarefas cadastradas no TaskFlow.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0">
          <div className="w-16 h-16 rounded-2xl bg-white text-indigo-900 flex flex-col items-center justify-center font-extrabold shadow-md">
            <span className="text-2xl leading-none">{rate}%</span>
            <span className="text-[10px] uppercase font-bold text-slate-500 mt-0.5">Taxa</span>
          </div>
          <div className="text-xs space-y-1 text-indigo-100">
            <p className="flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {completed} Concluídas
            </p>
            <p className="flex items-center gap-1.5 font-semibold">
              <Flame className="w-3.5 h-3.5 text-amber-400" /> {pending} Pendentes
            </p>
          </div>
        </div>
      </div>

      {/* Grid de Gráficos e Detalhes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico 1: Progresso por Categoria */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <PieChart className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Progresso por Categoria</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Categorias Ativas</span>
          </div>

          <div className="space-y-4">
            {categoryStats.map((item) => (
              <div key={item.category.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.category.color.dot}`}></span>
                    <span className="font-bold text-slate-800">{item.category.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500">
                    <span>
                      {item.completed}/{item.total} feitas
                    </span>
                    <span className="font-extrabold text-slate-900 w-9 text-right">
                      {item.rate}%
                    </span>
                  </div>
                </div>

                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${item.category.color.dot}`}
                    style={{ width: `${item.rate}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico 2: Tarefas por Nível de Prioridade */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                <BarChart2 className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Volume por Prioridade</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Concluídas vs Total</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {priorityStats.map((item) => {
              const colors = {
                ALTA: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', bar: 'bg-rose-500' },
                MÉDIA: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', bar: 'bg-amber-500' },
                BAIXA: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', bar: 'bg-emerald-500' },
              };
              const c = colors[item.priority];
              const pRate = item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0;

              return (
                <div
                  key={item.priority}
                  className={`p-4 rounded-2xl border ${c.border} ${c.bg} flex flex-col justify-between`}
                >
                  <div>
                    <span className={`text-[11px] font-extrabold uppercase ${c.text}`}>
                      {item.priority}
                    </span>
                    <div className="mt-2 text-2xl font-extrabold text-slate-900">{item.total}</div>
                    <p className="text-[11px] text-slate-600 mt-0.5 font-medium">
                      {item.completed} concluídas
                    </p>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-1">
                      <span>Progresso</span>
                      <span>{pRate}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/80 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${pRate}%` }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dica de produtividade */}
          <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
            <Zap className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong className="text-slate-800">Dica de Produtividade:</strong> Conclua primeiro as tarefas de{' '}
              <span className="font-bold text-rose-600">Prioridade Alta</span> pela manhã para reduzir a carga cognitiva do restante do dia.
            </p>
          </div>
        </div>
      </div>

      {/* Tarefas de Alta Prioridade Pendentes */}
      {urgentPendingTasks.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <h3 className="text-base font-bold text-slate-900">Tarefas de Alta Prioridade Pendentes</h3>
            </div>
            <button
              type="button"
              onClick={onGoToTasks}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              Ver na lista <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {urgentPendingTasks.map((t) => {
              const cat = categoryMap.get(t.categoryId);
              return (
                <div
                  key={t.id}
                  className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-indigo-200 transition-all"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    {cat && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${cat.color.badgeBg} ${cat.color.badgeText}`}>
                        {cat.name}
                      </span>
                    )}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                      ALTA
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{t.title}</h4>
                  {t.description && <p className="text-xs text-slate-500 mt-1 line-clamp-1">{t.description}</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
