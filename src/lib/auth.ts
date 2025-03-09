import { supabase } from './supabase';

export async function isAdmin(): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('is_admin');
    if (error) throw error;
    return data || false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Context to avoid unnecessary re-renders
import { createContext, useContext } from 'react';
import { Theme } from './theme';

export const AuthContext = createContext<{
  isAdmin: boolean;
  user: any | null;
  loading: boolean;
  preferredRegion: string;
  theme: Theme;
}>({
  isAdmin: false,
  user: null,
  loading: true,
  preferredRegion: 'Царигрaдски Комплекс',
  theme: 'system',
});

export const useAuth = () => useContext(AuthContext);