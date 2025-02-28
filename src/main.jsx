import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import supabase from './utils/supabase.js'
import NavBar from './components/NavBar.jsx'
import Login from './pages/Login.jsx';
import Products from './pages/Products.jsx'

function MainApp() { // eslint-disable-line react-refresh/only-export-components
  const [session, setSession] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      await supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session)
      })

      // Subscribe to authentication state changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session)
      })

      setIsLoading(false)
      // Fetch the session on mount
      // Cleanup subscription on unmount
      return () => subscription.unsubscribe()
    }
    getUser()

    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const type = params.get('type');

    // If the `type` parameter exists and equals 'recovery', redirect to /resetPassword
    if (type === 'recovery') {
      setTimeout(() => { window.location.href = '/resetPassword'; }, 500)
    }
  }, [])

  return !isLoading && (
    <Router>
      <div className="min-h-screen flex flex-col">
        <NavBar session={session} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<App session={session} />} />
            <Route path="/login" element={<Login session={session} />} />
            <Route path="/products" element={<Products />} />
            {/* <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/shops" element={<ShopsPage />} />
            <Route path="/shop/:id" element={<ShopDetailPage />} /> */}
          </Routes>
        </main>
      </div>
    </Router>
  )
}
// Render the MainApp component
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MainApp />
    {/* <Analytics /> */}
  </React.StrictMode>
)