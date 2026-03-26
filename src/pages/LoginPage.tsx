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
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden cyber-grid"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Animated background orbs */}
      <div
        className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
          animation: 'float 6s ease-in-out infinite',
        }}
      />
      <div
        className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'float 8s ease-in-out infinite reverse',
        }}
      />

      {/* Scan line effect */}
      <div className="scan-line absolute inset-0 pointer-events-none" />

      {/* Card */}
      <div
        className="w-full max-w-md relative z-10 fade-in"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 font-mono text-xs tracking-widest"
            style={{
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.3)',
              color: 'var(--accent-primary)',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: 'var(--accent-primary)',
                boxShadow: '0 0 6px var(--accent-primary)',
                animation: 'pulse-glow 2s infinite',
              }}
            />
            SECURE CONNECTION
          </div>

          <h1
            className="text-5xl font-black tracking-tight mb-1 gradient-text"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            ARN<span style={{ color: 'var(--text-primary)', WebkitTextFillColor: 'var(--text-primary)' }}> AI</span>
          </h1>
          <p className="font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>
            // Cybersecurity Intelligence Platform
          </p>
        </div>

        {/* Login Card */}
        <div
          className="rounded-2xl p-8 relative overflow-hidden"
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid rgba(99,102,241,0.2)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          {/* Top accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background: 'linear-gradient(90deg, transparent, var(--accent-primary), transparent)',
            }}
          />

          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--accent-primary)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)', lineHeight: 1 }}>Autentifikasiya</h2>
              <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                &gt; kimlik_yoxla()
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              className="mb-5 px-4 py-3 rounded-xl text-sm font-mono flex items-center gap-2 fade-in"
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: '#f87171',
              }}
            >
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                className="block text-xs font-mono mb-2 tracking-wider uppercase"
                style={{ color: 'var(--text-secondary)' }}
              >
                // email_adresi
              </label>
              <div className="relative">
                <span
                  className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs"
                  style={{ color: 'var(--accent-primary)', opacity: 0.7 }}
                >
                  @
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-8 font-mono text-sm"
                  placeholder="istifadeci@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                className="block text-xs font-mono mb-2 tracking-wider uppercase"
                style={{ color: 'var(--text-secondary)' }}
              >
                // şifrə_hash
              </label>
              <div className="relative">
                <span
                  className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs"
                  style={{ color: 'var(--accent-primary)', opacity: 0.7 }}
                >
                  #
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-8 font-mono text-sm"
                  placeholder="••••••••••••"
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
              style={{ borderRadius: '0.75rem' }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="font-mono tracking-wider">YÜKLƏNIR...</span>
                </>
              ) : (
                <>
                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="font-mono tracking-wider">GİRİŞ ET</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
            <span className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
          </div>

          {/* Register link */}
          <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            Hesabın yoxdur?{' '}
            <Link
              to="/register"
              className="font-semibold font-mono transition-colors"
              style={{ color: 'var(--accent-primary)' }}
            >
              &gt; Qeydiyyat_
            </Link>
          </p>
        </div>

        {/* Footer hint */}
        <p
          className="text-center mt-5 font-mono text-xs"
          style={{ color: 'rgba(148,163,184,0.35)' }}
        >
          AZTU · CyberSec Dept · REDBOARD v1.0
        </p>
      </div>
    </div>
  )
}
