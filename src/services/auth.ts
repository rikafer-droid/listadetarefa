import { supabase, isSupabaseConfigured } from './supabase';
import type { UserProfile } from '../types/auth';

export const authService = {
  // Obter sessão atual
  async getSession() {
    if (!isSupabaseConfigured) return null;
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.warn('Erro ao obter sessão:', error.message);
      return null;
    }
    return session;
  },

  // Obter usuário atual
  async getCurrentUser() {
    if (!isSupabaseConfigured) return null;
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.warn('Erro ao obter usuário atual:', error.message);
      return null;
    }
    return user;
  },

  // Login com E-mail e Senha
  async signIn(email: string, password: string) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase não configurado no arquivo .env');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('E-mail ou senha incorretos. Verifique suas credenciais.');
      }
      if (error.message.includes('Email not confirmed')) {
        throw new Error('E-mail ainda não confirmado. Verifique sua caixa de entrada.');
      }
      throw new Error(error.message);
    }

    return data;
  },

  // Cadastro de Novo Usuário
  async signUp(email: string, password: string, fullName: string) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase não configurado no arquivo .env');
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
      },
    });

    if (error) {
      if (error.message.includes('User already registered')) {
        throw new Error('Este e-mail já está cadastrado. Tente entrar ou recuperar a senha.');
      }
      if (error.message.includes('Password should be at least 6 characters')) {
        throw new Error('A senha deve conter no mínimo 6 caracteres.');
      }
      throw new Error(error.message);
    }

    // Se o usuário foi criado, inicializa ou garante o perfil
    if (data.user) {
      try {
        await this.upsertProfile({
          id: data.user.id,
          email: data.user.email || email,
          fullName: fullName.trim() || email.split('@')[0],
          createdAt: new Date().toISOString(),
        });
      } catch (profileErr) {
        console.warn('Perfil será sincronizado posteriormente:', profileErr);
      }
    }

    return data;
  },

  // Logout / Sair
  async signOut() {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erro ao deslogar:', error);
      throw error;
    }
  },

  // Recuperação de Senha (envia e-mail com link de reset)
  async resetPassword(email: string) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase não configurado');
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/#reset-password`,
    });

    if (error) {
      throw new Error(error.message);
    }
  },

  // Atualizar Senha (após clicar no link de recuperação)
  async updatePassword(newPassword: string) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase não configurado');
    }

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  // Buscar Perfil do Usuário
  async getProfile(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured || !userId) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Aviso ao buscar perfil:', error.message);
        return null;
      }

      if (!data) return null;

      return {
        id: data.id,
        email: data.email,
        fullName: data.full_name || data.email?.split('@')[0] || 'Usuário',
        avatarUrl: data.avatar_url,
        createdAt: data.created_at,
      };
    } catch (err) {
      console.warn('Erro ao consultar profiles:', err);
      return null;
    }
  },

  // Atualizar Perfil
  async upsertProfile(profile: Partial<UserProfile> & { id: string; email: string }) {
    if (!isSupabaseConfigured) return null;

    const payload = {
      id: profile.id,
      email: profile.email,
      full_name: profile.fullName || profile.email.split('@')[0],
      avatar_url: profile.avatarUrl || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.warn('Erro ao salvar profile:', error);
      throw error;
    }

    return data;
  },

  // Atualizar apenas Nome ou Avatar do Usuário
  async updateProfileData(userId: string, updates: { fullName?: string; avatarUrl?: string }) {
    if (!isSupabaseConfigured) return null;

    const payload: Record<string, string> = {
      updated_at: new Date().toISOString(),
    };
    if (updates.fullName !== undefined) payload.full_name = updates.fullName;
    if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl;

    const { data, error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
