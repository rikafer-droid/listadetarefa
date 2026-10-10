import React from 'react';
import type { ViewTab } from '../types/task';
import { useAuth } from '../context/AuthContext';
import {
  CheckSquare,
  BarChart3,
  Calendar,
  LogOut,
  Database,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

interface NavbarProps {
  currentTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  pendingCount: number;
  onOpenLogout: () => void;
  onOpenProfile: () => void;
  onOpenSupabaseModal: () => void;
  isSupabaseOnline?: boolean;
  isSyncing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  pendingCount,
  onOpenLogout,
  onOpenProfile,
  onOpenSupabaseModal,
  isSupabaseOnline = true,
  isSyncing = false,
}) => {
  const { user, profile } = useAuth();
  const displayName = profile?.fullName || user?.email?.split('@')[0] || 'Usuário';
  const initialLetter = (displayName.charAt(0) || 'U').toUpperCase();

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-100 ring-4 ring-indigo-50">
              <CheckSquare className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-slate-900">TaskFlow</span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  <Sparkles className="w-3 h-3 mr-1 text-indigo-500" /> Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">Gestão inteligente de tarefas</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2 bg-slate-100/90 p-1.5 rounded-xl border border-slate-200/60" aria-label="Navegação principal">
            <button
              type="button"
              id="nav-tab-tarefas"
              onClick={() => onTabChange('tarefas')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                currentTab === 'tarefas'
                  ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Tarefas</span>
              {pendingCount > 0 && (
                <span
                  className={`text-[11px] font-bold px-1.5 py-0.2 rounded-full ${
                    currentTab === 'tarefas'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              type="button"
              id="nav-tab-analises"
              onClick={() => onTabChange('analises')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                currentTab === 'analises'
                  ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Análises</span>
            </button>

            <button
              type="button"
              id="nav-tab-calendario"
              onClick={() => onTabChange('calendario')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                currentTab === 'calendario'
                  ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Calendário</span>
            </button>
          </nav>

          {/* Right Actions: Supabase Status, User Profile & Sair */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onOpenSupabaseModal}
              title={isSupabaseOnline ? 'Conectado ao Supabase: lista-tarefas' : 'Modo offline com LocalStorage'}
              className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isSupabaseOnline
                  ? 'text-emerald-700 bg-emerald-50/90 border-emerald-200 hover:bg-emerald-100/90 shadow-xs'
                  : 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100'
              }`}
            >
              {isSyncing ? (
                <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
              ) : (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
              <Database className="w-3.5 h-3.5" />
              <span>Supabase</span>
            </button>

            {/* Perfil do Usuário Logado */}
            {user && (
              <button
                type="button"
                id="btn-perfil-usuario"
                onClick={onOpenProfile}
                title={`Perfil de ${displayName} (${user.email})`}
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200/80 hover:border-indigo-200 transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                  {initialLetter}
                </div>
                <div className="hidden sm:block text-left">
                  <span className="block text-xs font-bold text-slate-800 leading-tight truncate max-w-[110px]">
                    {displayName}
                  </span>
                  <span className="block text-[10px] text-slate-500 leading-tight">Meu Perfil</span>
                </div>
              </button>
            )}

            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

            {/* Logout / Sair Button */}
            <button
              type="button"
              id="btn-sair"
              onClick={onOpenLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all duration-150 cursor-pointer"
              title="Encerrar sessão ou gerenciar dados"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden xs:inline">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
