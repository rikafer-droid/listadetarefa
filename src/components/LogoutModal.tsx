import React from 'react';
import { LogOut, Download, RefreshCw, X, ShieldCheck, Database } from 'lucide-react';
import { storageService } from '../services/storage';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetData: () => void;
  totalTasks: number;
  completedTasks: number;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  onClose,
  onResetData,
  totalTasks,
  completedTasks,
}) => {
  if (!isOpen) return null;

  const handleExport = () => {
    const data = storageService.exportDataJson();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden animate-modal-slide"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <LogOut className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Gerenciar Sessão & Dados</h3>
              <p className="text-xs text-slate-500">TaskFlow Local Storage</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Status do armazenamento */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Database className="w-4 h-4 text-indigo-600" /> Seus dados locais
              </span>
              <span className="text-emerald-600 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> Salvo no Navegador
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Você tem <strong>{totalTasks}</strong> tarefas armazenadas com segurança neste dispositivo, sendo{' '}
              <strong>{completedTasks}</strong> já concluídas.
            </p>
          </div>

          {/* Opções de Backup e Restauração */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleExport}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:border-indigo-300 bg-white hover:bg-indigo-50/50 text-slate-700 hover:text-indigo-700 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-indigo-600" />
              <span>Fazer Backup dos Dados (Baixar JSON)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('Tem certeza que deseja restaurar as tarefas de exemplo? Suas edições atuais serão redefinidas.')) {
                  onResetData();
                  onClose();
                }
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:border-amber-300 bg-white hover:bg-amber-50/50 text-slate-700 hover:text-amber-700 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-amber-600" />
              <span>Restaurar Tarefas de Demonstração</span>
            </button>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">Sessão Local Ativa</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
};
