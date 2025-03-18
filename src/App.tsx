import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider from './components/AuthProvider';
import Auth from './components/Auth';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Stores from './pages/Stores';
import Products from './pages/Products';
import PriceComparison from './pages/PriceComparison';
import Home from './pages/Home';
import AdminDashboard from './components/AdminDashboard';
import { useAuth } from './lib/auth';
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"
import { ShoppingCart } from 'lucide-react';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
      <Analytics />
      <SpeedInsights />
    </AuthProvider>
  );
}

function AppRoutes() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <ShoppingCart className="h-8 w-8 text-blue-500" />
      <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
        Цени у магазините - Зареждане...
      </span>
    </div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />} >
        <Route index element={<Home />} />
        <Route path="compare" element={<PriceComparison />} />

        {/* Protected routes */}
        <Route
          path="stores"
          element={
            user ? (
              <Stores />
            ) : (
              <Navigate to="/auth" state={{ from: '/stores' }} replace />
            )
          }
        />
        <Route
          path="products"
          element={
            user ? (
              <Products />
            ) : (
              <Navigate to="/auth" state={{ from: '/products' }} replace />
            )
          }
        />
        <Route
          path="dashboard"
          element={
            user ? (
              isAdmin ? (
                <>
                  <Dashboard />
                  <AdminDashboard />
                </>
              ) : (
                <Dashboard />
              )
            ) : (
              <Navigate to="/auth" state={{ from: '/dashboard' }} replace />
            )
          }
        />

        {/* Auth route */}
        <Route
          path="auth"
          element={user ? <Navigate to="/dashboard" replace /> : <Auth />}
        />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}

export default App;