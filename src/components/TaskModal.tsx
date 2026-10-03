import React, { useState, useEffect } from 'react';
import type { Task, Category, Priority } from '../types/task';
import { X, Calendar, Flag, Tag, Plus, Check } from 'lucide-react';
import { format, addDays } from 'date-fns';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: {
    title: string;
    description?: string;
    categoryId: string;
    priority: Priority;
    dueDate: string;
  }) => void;
  taskToEdit?: Task | null;
  categories: Category[];
  onAddCategory: (category: Category) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  taskToEdit,
  categories,
  onAddCategory,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState<Priority>('MÉDIA');
  const [dueDate, setDueDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));

  // Estado para criação rápida de nova categoria
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('indigo');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setCategoryId(taskToEdit.categoryId);
      setPriority(taskToEdit.priority);
      setDueDate(taskToEdit.dueDate);
    } else {
      setTitle('');
      setDescription('');
      setCategoryId(categories[0]?.id || 'trabalho');
      setPriority('MÉDIA');
      setDueDate(format(new Date(), 'yyyy-MM-dd'));
    }
    setIsCreatingCategory(false);
  }, [taskToEdit, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      categoryId: categoryId || categories[0]?.id || 'trabalho',
      priority,
      dueDate,
    });
    onClose();
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    const colorMaps: Record<string, Category['color']> = {
      indigo: {
        bg: 'bg-indigo-50',
        text: 'text-indigo-700',
        border: 'border-indigo-200',
        badgeBg: 'bg-indigo-100',
        badgeText: 'text-indigo-800',
        dot: 'bg-indigo-500',
      },
      emerald: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        badgeBg: 'bg-emerald-100',
        badgeText: 'text-emerald-800',
        dot: 'bg-emerald-500',
      },
      purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        badgeBg: 'bg-purple-100',
        badgeText: 'text-purple-800',
        dot: 'bg-purple-500',
      },
      amber: {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        badgeBg: 'bg-amber-100',
        badgeText: 'text-amber-800',
        dot: 'bg-amber-500',
      },
      rose: {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        badgeBg: 'bg-rose-100',
        badgeText: 'text-rose-800',
        dot: 'bg-rose-500',
      },
      cyan: {
        bg: 'bg-cyan-50',
        text: 'text-cyan-700',
        border: 'border-cyan-200',
        badgeBg: 'bg-cyan-100',
        badgeText: 'text-cyan-800',
        dot: 'bg-cyan-500',
      },
    };

    const newId = 'cat-' + Date.now();
    const newCat: Category = {
      id: newId,
      name: newCategoryName.trim().toUpperCase(),
      color: colorMaps[newCategoryColor] || colorMaps.indigo,
    };

    onAddCategory(newCat);
    setCategoryId(newId);
    setNewCategoryName('');
    setIsCreatingCategory(false);
  };

  const setDatePreset = (daysOffset: number) => {
    const d = addDays(new Date(), daysOffset);
    setDueDate(format(d, 'yyyy-MM-dd'));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden animate-modal-slide"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
              {taskToEdit ? <Calendar className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {taskToEdit && taskToEdit.id ? 'Editar Tarefa' : 'Nova Tarefa'}
              </h3>
              <p className="text-xs text-slate-500">Preencha os detalhes para organizar seu dia</p>
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

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Título */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Título da Tarefa <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Finalizar proposta comercial para cliente..."
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Descrição (Opcional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Adicione detalhes, links ou notas importantes..."
              className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-slate-800 placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* Grid de Categoria e Prioridade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Categoria */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-slate-500" /> Categoria
                </label>
                {!isCreatingCategory && (
                  <button
                    type="button"
                    onClick={() => setIsCreatingCategory(true)}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    + Nova
                  </button>
                )}
              </div>

              {!isCreatingCategory ? (
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-medium rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-slate-800 bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <input
                    type="text"
                    placeholder="Nome da categoria..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {['indigo', 'emerald', 'purple', 'amber', 'rose', 'cyan'].map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewCategoryColor(color)}
                          className={`w-5 h-5 rounded-full bg-${color}-500 transition-transform cursor-pointer ${
                            newCategoryColor === color ? 'scale-125 ring-2 ring-slate-800' : ''
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={handleCreateCategory}
                        className="px-2 py-1 bg-indigo-600 text-white rounded text-[11px] font-bold cursor-pointer"
                      >
                        Salvar
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCreatingCategory(false)}
                        className="px-2 py-1 bg-slate-200 text-slate-600 rounded text-[11px] cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Prioridade */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                <Flag className="w-3.5 h-3.5 text-slate-500" /> Prioridade
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['BAIXA', 'MÉDIA', 'ALTA'] as Priority[]).map((p) => {
                  const colors = {
                    BAIXA: 'text-emerald-700 border-emerald-300 bg-emerald-50',
                    MÉDIA: 'text-amber-700 border-amber-300 bg-amber-50',
                    ALTA: 'text-rose-700 border-rose-300 bg-rose-50',
                  };
                  const isSelected = priority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? `${colors[p]} shadow-xs ring-2 ring-offset-1 ring-slate-400 font-extrabold`
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Data de Vencimento */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" /> Data de Conclusão
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="flex-1 px-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-slate-800 bg-white"
              />
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setDatePreset(0)}
                  className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 transition-colors cursor-pointer"
                >
                  Hoje
                </button>
                <button
                  type="button"
                  onClick={() => setDatePreset(1)}
                  className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 transition-colors cursor-pointer"
                >
                  Amanhã
                </button>
                <button
                  type="button"
                  onClick={() => setDatePreset(7)}
                  className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 transition-colors cursor-pointer"
                >
                  +7 Dias
                </button>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl shadow-md shadow-indigo-100 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              {taskToEdit && taskToEdit.id ? 'Salvar Alterações' : 'Criar Tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
