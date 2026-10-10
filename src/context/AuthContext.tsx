import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { authService } from '../services/auth';
import type { UserProfile } from '../types/auth';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isPasswordRecovery: boolean;
  setIsPasswordRecovery: (value: boolean) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  updateProfile: (updates: { fullName?: string; avatarUrl?: string }) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState<boolean>(false);

  // Carregar dados de perfil do usuário
  const fetchProfile = useCallback(async (currentUserId: string, userEmail?: string, rawMetadata?: any) => {
    try {
      let userProf = await authService.getProfile(currentUserId);
      if (!userProf && userEmail) {
        // Criar perfil em fallback caso ainda não exista
        const fallbackName = rawMetadata?.full_name || userEmail.split('@')[0];
        userProf = {
          id: currentUserId,
          email: userEmail,
          fullName: fallbackName,
          createdAt: new Date().toISOString(),
        };
        try {
          await authService.upsertProfile(userProf);
        } catch {
          // Fallback silencioso
        }
      }
      setProfile(userProf);
    } catch (err) {
      console.warn('Erro ao carregar perfil:', err);
    }
  }, []);

  // Inicialização e escuta de mudanças de autenticação
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    // Verificar hash da URL para identificar recuperação de senha
    if (window.location.hash.includes('type=recovery') || window.location.hash.includes('access_token=')) {
      setIsPasswordRecovery(true);
    }

    // Obter sessão inicial
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id, currentUser.email, currentUser.user_metadata);
      }
      setIsLoading(false);
    });

    // Escutar eventos de Auth (login, logout, refresh, password recovery)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      const currentUser = newSession?.user ?? null;
      setUser(currentUser);

      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
      }

      if (currentUser) {
        await fetchProfile(currentUser.id, currentUser.email, currentUser.user_metadata);
      } else {
        setProfile(null);
      }

      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await authService.signIn(email, password);
      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        await fetchProfile(data.user.id, data.user.email, data.user.user_metadata);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    try {
      const data = await authService.signUp(email, password, fullName);
      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        await fetchProfile(data.user.id, data.user.email, { full_name: fullName });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    await authService.resetPassword(email);
  };

  const updatePassword = async (newPassword: string) => {
    await authService.updatePassword(newPassword);
    setIsPasswordRecovery(false);
  };

  const updateProfile = async (updates: { fullName?: string; avatarUrl?: string }) => {
    if (!user) return;
    await authService.updateProfileData(user.id, updates);
    if (profile) {
      setProfile({
        ...profile,
        fullName: updates.fullName !== undefined ? updates.fullName : profile.fullName,
        avatarUrl: updates.avatarUrl !== undefined ? updates.avatarUrl : profile.avatarUrl,
      });
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user.email, user.user_metadata);
    }
  };

  const value = {
    user,
    session,
    profile,
    isLoading,
    isPasswordRecovery,
    setIsPasswordRecovery,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}
