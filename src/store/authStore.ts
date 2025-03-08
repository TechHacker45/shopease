import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  error: null,

  initialize: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      set({ 
        session: data.session, 
        user: data.session?.user || null,
        isLoading: false 
      });

      // Set up auth state change listener
      supabase.auth.onAuthStateChange((event, session) => {
        set({ 
          session, 
          user: session?.user || null
        });
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ error: 'Failed to initialize authentication', isLoading: false });
    }
  },

  signUp: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      
      set({ 
        session: data.session, 
        user: data.session?.user || null,
        isLoading: false 
      });
    } catch (error: any) {
      console.error('Error signing up:', error);
      set({ error: error?.message || 'Failed to sign up', isLoading: false });
    }
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      set({ 
        session: data.session, 
        user: data.user,
        isLoading: false 
      });
    } catch (error: any) {
      console.error('Error signing in:', error);
      set({ error: error?.message || 'Failed to sign in', isLoading: false });
    }
  },

  signOut: async () => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      set({ user: null, session: null, isLoading: false });
    } catch (error: any) {
      console.error('Error signing out:', error);
      set({ error: error?.message || 'Failed to sign out', isLoading: false });
    }
  },
}));