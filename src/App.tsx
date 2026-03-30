import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { supabase } from './lib/supabase'
import LandingPage from './pages/LandingPage'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ChatPage from './pages/ChatPage'
import PricingPage from './pages/PricingPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  const { fetchProfile, user, loading } = useAuthStore()

  useEffect(() => {
    fetchProfile()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚡</div>
          <div className="text-indigo-400 text-xl animate-pulse">ARN AI yüklənir...</div>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/chat" /> : <LandingPage />} />
        <Route path="/login" element={user ? <Navigate to="/chat" /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/chat" /> : <RegisterPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Layout><ChatPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout><SettingsPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={user ? "/chat" : "/"} />} />
      </Routes>
    </BrowserRouter>