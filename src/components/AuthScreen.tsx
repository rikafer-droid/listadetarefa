import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  CheckSquare,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Zap,
} from 'lucide-react';
import type { AuthMode } from '../types/auth';

export const AuthScreen: React.FC = () => {
  const {
    signIn,
    signUp,
    resetPassword,
    updatePassword,
    isPasswordRecovery,
    setIsPasswordRecovery,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>(isPasswordRecovery ? 'update_password' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Preencher credenciais padrão para demonstração rápida
  const handleFillDemoCredentials = () => {
    setMode('login');
    setEmail('rikafer@gmail.com');
    setPassword('21397sa');
    setErrorMessage(null);
    setSuccessMessage('Credenciais de teste preenchidas! Clique em "Entrar no TaskFlow".');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validações básicas
    if (mode === 'login' || mode === 'register') {
      if (!email.trim() || !password) {
        setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
        return;
      }
    }

    if (mode === 'register') {
      if (!fullName.trim()) {
        setErrorMessage('Por favor, informe seu nome completo.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('A senha deve conter no mínimo 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('As senhas não coincidem. Verifique a digitação.');
        return;
      }
    }

    if (mode === 'forgot_password') {
      if (!email.trim()) {
        setErrorMessage('Por favor, informe seu e-mail cadastrado.');
        return;
      }
    }

    if (mode === 'update_password') {
      if (password.length < 6) {
        setErrorMessage('A nova senha deve conter no mínimo 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('As senhas não coincidem. Verifique a digitação.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else if (mode === 'register') {
        await signUp(email, password, fullName);
        setSuccessMessage('Conta criada com sucesso! Você já pode utilizar suas tarefas.');
      } else if (mode === 'forgot_password') {
        await resetPassword(email);
        setSuccessMessage('Instruções para redefinição enviadas para o seu e-mail. Verifique sua caixa de entrada.');
      } else if (mode === 'update_password') {
        await updatePassword(password);
        setSuccessMessage('Senha atualizada com sucesso! Você já pode acessar sua conta.');
        setTimeout(() => {
          setIsPasswordRecovery(false);
          setMode('login');
        }, 2000);
      }
    } catch (err: any) {
      console.error('Erro na autenticação:', err);
      setErrorMessage(err?.message || 'Ocorreu um erro ao processar a solicitação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Luzes de fundo dinâmicas */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

      {/* Cabeçalho da Aplicação */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white shadow-xl shadow-indigo-500/25 ring-8 ring-indigo-500/10 mb-4 animate-bounce-short">
          <CheckSquare className="w-8 h-8 stroke-[2.5]" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
          TaskFlow
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Sparkles className="w-3 h-3 mr-1 text-indigo-400" /> Cloud
          </span>
        </h1>
        <p className="mt-2 text-sm text-slate-400 max-w-sm mx-auto">
          Gestão inteligente de tarefas com autenticação e sincronização em tempo real via Supabase.
        </p>
      </div>

      {/* Card Principal */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-white/95 backdrop-blur-xl py-8 px-6 shadow-2xl shadow-indigo-950/50 rounded-3xl border border-white/20 sm:px-10 space-y-6">
          
          {/* Navegação de Abas (Login / Cadastro) */}
          {mode !== 'update_password' && (
            <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
              <button
                type="button"
                id="tab-login"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                id="tab-cadastro"
                onClick={() => {
                  setMode('register');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                  mode === 'register'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Criar Conta
              </button>
              <button
                type="button"
                id="tab-recuperar"
                onClick={() => {
                  setMode('forgot_password');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                  mode === 'forgot_password'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Recuperar
              </button>
            </div>
          )}

          {/* Banner de Usuário de Demonstração */}
          {mode === 'login' && (
            <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-3.5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Conta de Demonstração</span>
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-indigo-200/60 text-indigo-800 px-2 py-0.5 rounded-full">
                  Pronto para uso
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Acesse como <strong className="font-semibold text-slate-800">rikafer@gmail.com</strong> com tarefas já sincronizadas no Supabase.
              </p>
              <button
                type="button"
                onClick={handleFillDemoCredentials}
                className="w-full mt-1 py-1.5 px-3 bg-white hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 hover:border-indigo-600 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Preencher credenciais de teste</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Alertas de Erro e Sucesso */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{successMessage}</div>
            </div>
          )}

          {/* Formulário Principal */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Campo Nome Completo (Apenas Cadastro) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nome Completo
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Seu nome ou apelido"
                    className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}

            {/* Campo E-mail (Login, Cadastro e Recuperação) */}
            {mode !== 'update_password' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Endereço de E-mail
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemplo@email.com"
                    autoComplete="email"
                    className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}

            {/* Campo Senha (Login, Cadastro e Atualização) */}
            {mode !== 'forgot_password' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {mode === 'update_password' ? 'Nova Senha' : 'Senha'}
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot_password');
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                    >
                      Esqueceu a senha?
                    </button>
                  )}
                </div>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {mode === 'register' && (
                  <p className="mt-1 text-[11px] text-slate-500">Mínimo de 6 caracteres.</p>
                )}
              </div>
            )}

            {/* Campo Confirmar Senha (Cadastro ou Atualização de Senha) */}
            {(mode === 'register' || mode === 'update_password') && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirmar Senha
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Botão de Envio */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                id="btn-submit-auth"
                className="w-full py-3 px-4 rounded-xl text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 font-bold text-xs sm:text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processando...</span>
                  </>
                ) : (
                  <>
                    {mode === 'login' && <span>Entrar no TaskFlow</span>}
                    {mode === 'register' && <span>Cadastrar Conta</span>}
                    {mode === 'forgot_password' && <span>Enviar Link de Recuperação</span>}
                    {mode === 'update_password' && <span>Salvar Nova Senha</span>}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Links e Alternâncias */}
          {mode === 'forgot_password' && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                ← Voltar para a tela de login
              </button>
            </div>
          )}

          {/* Rodapé de Segurança */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Autenticação segura protegida por Supabase Auth & JWT</span>
          </div>
        </div>
      </div>
    </div>
  );
};
