import { useState, useEffect } from 'react';
import { createClient, User } from '@supabase/supabase-js';
import Swal from 'sweetalert2';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  }
);

const handleAuthError = async (error: Error) => {
  // Only show error for non-session related issues
  if (!error.message.includes('refresh_token_not_found') && 
      !error.message.includes('session_not_found')) {
    await Swal.fire({
      title: 'Authentication Error',
      text: error.message,
      icon: 'error',
      background: '#1e293b',
      color: '#fff',
      confirmButtonColor: '#3b82f6'
    });
  }
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        if (mounted) {
          setUser(null);
          setLoading(false);
          await handleAuthError(error as Error);
        }
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          setUser(null);
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUser(session?.user ?? null);
        }
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
    } catch (error) {
      await handleAuthError(error as Error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password
      });
      if (error) throw error;
    } catch (error) {
      await handleAuthError(error as Error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        // Handle specific error cases
        if (error.message.includes('session_not_found')) {
          // Session already expired/invalid, just clear the local state
          setUser(null);
          return;
        }
        throw error;
      }
    } catch (error) {
      console.error('Sign out error:', error);
      // Force clear user state even if sign out fails
      setUser(session?.user ?? null);
      await handleAuthError(error as Error);
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut
  };
}