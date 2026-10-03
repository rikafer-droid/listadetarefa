import React, { useState } from 'react';
import { Database, X, Check, Copy, ExternalLink, Code2, CloudCheck, RefreshCw, Layers } from 'lucide-react';
import { SUPABASE_SCHEMA_SQL, isSupabaseConfigured } from '../services/supabase';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalTasks?: number;
  totalCategories?: number;
  isOnline?: boolean;
  lastSyncedAt?: Date | null;
  onRefresh?: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  totalTasks = 0,
  totalCategories = 0,
  isOnline = true,
  lastSyncedAt,
  onRefresh,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden animate-modal-slide"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Integração Supabase Ativa</h3>
              <p className="text-xs text-slate-500">Projeto conectado: <strong className="text-emerald-700">lista-tarefas</strong></p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Status Box */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-950 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="font-bold text-xs text-emerald-900">
                  {isSupabaseConfigured && isOnline ? 'Nuvem Conectada e Sincronizada' : 'Conectando ao Supabase...'}
                </span>
              </div>
              {onRefresh && (
                <button
                  type="button"
                  onClick={onRefresh}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 bg-white/80 px-2.5 py-1 rounded-lg border border-emerald-200 hover:bg-white transition-all cursor-pointer shadow-2xs"
                >
                  <RefreshCw className="w-3 h-3" />
                  Sincronizar
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white/70 border border-emerald-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <div className="text-[10px] text-emerald-700 uppercase font-bold">Tarefas na Nuvem</div>
                  <div className="text-sm font-extrabold text-slate-800">{totalTasks}</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/70 border border-emerald-100 flex items-center gap-2">
                <CloudCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <div className="text-[10px] text-emerald-700 uppercase font-bold">Categorias</div>
                  <div className="text-sm font-extrabold text-slate-800">{totalCategories}</div>
                </div>
              </div>
            </div>

            {lastSyncedAt && (
              <p className="text-[11px] text-emerald-700">
                Última sincronização com a nuvem: <span className="font-semibold">{lastSyncedAt.toLocaleTimeString()}</span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Detalhes do Projeto Supabase:
            </h4>
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-xs space-y-2 text-slate-600">
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="font-medium text-slate-500">Nome do Projeto:</span>
                <span className="font-bold text-slate-800">lista-tarefas</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="font-medium text-slate-500">Tabelas Criadas:</span>
                <span className="font-bold text-slate-800">public.tasks, public.categories</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="font-medium text-slate-500">Sincronização em Tempo Real:</span>
                <span className="font-bold text-emerald-600">Supabase Realtime Ativo</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Code2 className="w-3.5 h-3.5" /> Schema SQL Aplicado
              </span>
              <button
                type="button"
                onClick={handleCopySql}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copiado!' : 'Copiar SQL'}
              </button>
            </div>
            <pre className="p-3 bg-slate-900 text-slate-300 rounded-xl text-[10px] font-mono overflow-x-auto max-h-36">
              {SUPABASE_SCHEMA_SQL}
            </pre>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
          >
            Abrir Painel do Supabase <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
