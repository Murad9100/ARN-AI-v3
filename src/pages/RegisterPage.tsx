import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signUp(email, password, fullName)
      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Qeydiyyat xətası')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="text-6xl mb-4">📧</div>
          <h2 className="text-2xl font-bold text-[#00ff88] mb-2">Email göndərildi!</h2>
          <p className="text-gray-400 mb-6">
            <strong className="text-white">{email}</strong> ünvanına təsdiq linki göndərildi.
            Email-i yoxlayıb linki klikləyin.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-[#00ff88] text-black font-bold rounded-lg hover:bg-[#00ff88]/90 transition-all"
          >
            Girişə keç
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#00ff88] mb-2">⚡ ARN AI</h1>
          <p className="text-gray-400">Cybersecurity Assistant</p>
        </div>
        <div className="glass rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Qeydiyyat</h2>
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Ad Soyad</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00ff88] transition-colors"
                placeholder="Ad Soyad"
                required
              />
            </div>
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
                minLength={6}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#00ff88] text-black font-bold rounded-lg hover:bg-[#00ff88]/90 transition-all disabled:opacity-50"
            >
              {loading ? 'Yüklənir...' : 'Qeydiyyatdan keç'}
            </button>
          </form>
          <p className="text-center text-gray-400 text-sm mt-6">
            Hesabın var?{' '}
            <Link to="/login" className="text-[#00ff88] hover:underline">
              Giriş et
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}