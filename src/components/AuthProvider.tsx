import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AuthContext, isAdmin as checkIsAdmin } from '../lib/auth';
import { setTheme as setThemeInStorage, Theme } from '../lib/theme';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [preferredRegion, setPreferredRegion] = useState<string>('Цариградски Комплекс');
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    // Get initial session
    const getUserAndAdminStatus = async () => {
      await supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          checkIsAdmin().then(setIsAdmin);
        }
        setLoading(false);
      });
      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        // Only ignore SIGNED_IN and TOKEN_REFRESHED events if we're not on the auth page
        const isAuthPage = window.location.pathname === '/auth';
        if (session && (_event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED') && !isAuthPage) {
          return;
        }

        setUser(session?.user ?? null);
        if (session?.user) {
          const isAdminUser = await checkIsAdmin();
          setIsAdmin(isAdminUser);
        } else {
          setIsAdmin(false);
        }
        setLoading(false);
      });
      return () => subscription.unsubscribe();
    }
    
    getUserAndAdminStatus();
  }, []);

  useEffect(() => {
    const getUserPreferences = async () => {
      const { data, error } = await supabase.from('user_preferences').select('preferred_region, theme').eq('user_id', user?.id).single();
      if (error) {
        console.error('Error getting user preferences:', error);
        return;
      }
      if (data) {
        setPreferredRegion(data.preferred_region);
        setTheme(data.theme);
        setThemeInStorage(data.theme);
      }
    }
    if (user) {
      getUserPreferences();
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, preferredRegion, theme, setPreferredRegion, setTheme }}>
      {children}
    </AuthContext.Provider>
  );
}