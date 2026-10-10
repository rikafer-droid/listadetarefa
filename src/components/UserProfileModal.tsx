import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Mail,
  Calendar,
  LogOut,
  X,
  Edit2,
  Check,
  Shield,
  Sparkles,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogoutModal: () => void;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenLogoutModal,
  totalTasks,
  completedTasks,
  pendingTasks,
}) => {
  const { user, profile, updateProfile } = useAuth();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(profile?.fullName || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen || !user) return null;

  const displayName = profile?.fullName || user.email?.split('@')[0] || 'Usuário';
  const displayEmail = user.email || '';
  const initialLetter = (displayName.charAt(0) || 'U').toUpperCase();

  const handleSaveName = async () => {
    if (!newName.trim() || newName === profile?.fullName) {
      setIsEditingName(false);
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({ fullName: newName.trim() });
      setIsEditingName(false);
    } catch (err) {
      console.error('Erro ao atualizar nome:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const createdDate = profile?.createdAt || user.created_at;
  let formattedCreatedDate = 'Recente';
  try {
    if (createdDate) {
      formattedCreatedDate = format(parseISO(createdDate), "dd 'de' MMMM 'de' yyyy", {
        locale: ptBR,
      });
    }
  } catch {
    formattedCreatedDate = 'Recente';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden animate-modal-slide"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header com Capa Gradiente */}
        <div className="relative h-28 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 p-6 flex items-start justify-between">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/20 text-white backdrop-blur-md">
            <Sparkles className="w-3 h-3 text-indigo-200" /> Perfil de Usuário
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Avatar e Informações */}
        <div className="px-6 pb-6 pt-0 -mt-12 space-y-6">
          <div className="flex items-end justify-between">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white font-black text-2xl flex items-center justify-center shadow-xl ring-4 ring-white border border-indigo-100">
              {initialLetter}
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenLogoutModal();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair da Conta</span>
            </button>
          </div>

          {/* Nome e E-mail */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {isEditingName ? (
                <div className="flex items-center gap-2 w-full">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="flex-1 px-3 py-1 bg-slate-50 border border-indigo-300 rounded-lg text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    placeholder="Seu nome"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleSaveName}
                    disabled={isSaving}
                    className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-extrabold text-slate-900">{displayName}</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setNewName(displayName);
                      setIsEditingName(true);
                    }}
                    className="text-slate-400 hover:text-indigo-600 p-1 rounded-md transition-colors cursor-pointer"
                    title="Editar nome"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{displayEmail}</span>
            </div>
          </div>

          {/* Estatísticas de Tarefas do Perfil */}
          <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
            <div className="p-2">
              <span className="block text-lg font-black text-slate-900">{totalTasks}</span>
              <span className="text-[11px] font-semibold text-slate-500">Total</span>
            </div>
            <div className="p-2 border-x border-slate-200">
              <span className="block text-lg font-black text-emerald-600">{completedTasks}</span>
              <span className="text-[11px] font-semibold text-slate-500">Concluídas</span>
            </div>
            <div className="p-2">
              <span className="block text-lg font-black text-indigo-600">{pendingTasks}</span>
              <span className="text-[11px] font-semibold text-slate-500">Pendentes</span>
            </div>
          </div>

          {/* Detalhes da Conta */}
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Membro desde</span>
              </div>
              <span className="font-semibold text-slate-800">{formattedCreatedDate}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-600">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>Autenticação</span>
              </div>
              <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Supabase Auth
              </span>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
