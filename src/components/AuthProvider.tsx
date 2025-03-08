import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AuthContext, isAdmin as checkIsAdmin } from '../lib/auth';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

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

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
}