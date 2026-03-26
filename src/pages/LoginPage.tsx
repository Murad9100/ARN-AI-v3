import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, fetchProfile } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      await fetchProfile()
      navigate('/chat')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Giriş xətası')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#00ff88] mb-2">⚡ ARN AI</h1>
          <p className="text-gray-400">Cybersecurity Assistant</p>
        </div>
        <div className="glass rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Giriş</h2>
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00ff88] transition-colors"
                placeholder="email@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Şifrə</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00ff88] transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#00ff88] text-black font-bold rounded-lg hover:bg-[#00ff88]/90 transition-all disabled:opacity-50"
            >
              {loading ? 'Yüklənir...' : 'Giriş et'}
            </button>
          </form>
          <p className="text-center text-gray-400 text-sm mt-6">
            Hesabın yoxdur?{' '}
            <Link to="/register" className="text-[#00ff88] hover:underline">
              Qeydiyyat
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}