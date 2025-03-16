import { Outlet, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ShoppingCart, LogOut, Menu, X, LogIn } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../lib/auth';
import UserSettings from './UserSettings';
import UpdateChecker from './UpdateChecker';

export default function Layout() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAdmin } = useAuth();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if(error) {
      console.error('Error logging out:', error.message);
      localStorage.removeItem('sb-jidzqeqmqpkwovevqbfa-auth-token');
    }
    setTimeout(() => {navigate('/');}, 100);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <ShoppingCart className="h-8 w-8 text-blue-500" />
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                  Цени у магазините {isAdmin && <span className="text-violet-500">| ADMIN</span>}
                </span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  <Link to="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                    Табло
                  </Link>
                  <Link to="/stores" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                    Магазини
                  </Link>
                  <Link to="/products" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                    Продукти
                  </Link>
                  <Link to="/compare" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                    Сравни цени
                  </Link>
                  <div className="flex items-center space-x-2">
                    <UserSettings />
                    <button
                      onClick={handleSignOut}
                      className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-1" />
                      Изход
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/compare" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                    Сравни цени
                  </Link>
                  <Link
                    to="/auth"
                    className="px-3 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 flex items-center"
                  >
                    <LogIn className="h-4 w-4 mr-1" />
                    Вход
                  </Link>
                </>
              )}
            </nav>
            
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                aria-label="Open menu"
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {user ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Табло
                  </Link>
                  <Link 
                    to="/stores" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Магазини
                  </Link>
                  <Link 
                    to="/products" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Продукти
                  </Link>
                  <Link 
                    to="/compare" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Сравни цени
                  </Link>
                  <div className="px-3 py-2">
                    <UserSettings />
                  </div>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  >
                    Изход
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/compare" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Сравни цени
                  </Link>
                  <Link
                    to="/auth"
                    className="block px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Вход
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
      
      {/* Main content */}
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            {new Date().getFullYear()} Цени у магазините. Никакви права запазени.
          </p>
          <UpdateChecker />
        </div>
      </footer>
    </div>
  );
}