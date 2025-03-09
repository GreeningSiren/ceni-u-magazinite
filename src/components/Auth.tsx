import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

type AuthMode = 'signin' | 'signup';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<AuthMode>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const from = location.state?.from || '/dashboard';

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        else {
          navigate(from);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Възникна неочаквана грешка');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="flex justify-center mb-6">
        <div className="bg-blue-500 p-3 rounded-full">
          <User className="h-8 w-8 text-white" />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
        {mode === 'signin' ? 'Вход в профила' : 'Създаване на нов профил'}
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleAuth}>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="email">
            Имейл
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="you@example.com"
              required
              autoFocus
            />
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="password">
            Парола
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
        >
          {loading ? 'Зареждане...' : mode === 'signin' ? 'Вход' : 'Регистрация'}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <button
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          className="text-blue-500 hover:text-blue-700 font-medium"
        >
          {mode === 'signin' ? "Нямате профил? Регистрирайте се" : "Вече имате профил? Влезте"}
        </button>
      </div>
    </div>
  );
}