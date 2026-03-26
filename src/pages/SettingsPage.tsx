import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'

export default function SettingsPage() {
  const { user, fetchProfile } = useAuthStore()
  const [fullName, setFullName] = useState(user?.full_name || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    setMessage('')
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id)
      if (error) throw error
      await fetchProfile()
      setMessage('success')
    } catch {
      setMessage('error')
    } finally {
      setSaving(false)
    }
  }

  const tokenPct = user
    ? Math.min(((user.tokens_used || 0) / (user.tokens_limit || 1)) * 100, 100)
    : 0

  const planColor =
    user?.plan === 'max'
      ? { bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.4)', text: '#c084fc', badge: 'linear-gradient(135deg,#8b5cf6,#7c3aed)' }
      : user?.plan === 'pro'
      ? { bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.35)', text: '#a5b4fc', badge: 'linear-gradient(135deg,#6366f1,#9333ea)' }
      : { bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.1)', text: 'var(--text-secondary)', badge: 'rgba(255,255,255,0.12)' }

  return (
    <div
      className="min-h-full p-6 cyber-grid"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div className="max-w-2xl mx-auto fade-in">

        {/* Page header */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'rgba(99,102,241,0.15)',
              border: '1px solid rgba(99,102,241,0.3)',
            }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--accent-primary)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-black" style={{ color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace" }}>
              Parametrlər
            </h1>
            <p className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
              &gt; config.edit()
            </p>
          </div>
        </div>

        <div className="space-y-4">

          {/* ── Profile section ── */}
          <div
            className="rounded-2xl p-6 relative overflow-hidden"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid rgba(99,102,241,0.18)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, var(--accent-primary), transparent)' }}
            />

            <div className="flex items-center gap-2 mb-5">
              <span className="font-mono text-xs" style={{ color: 'var(--accent-primary)' }}>//</span>
              <h3 className="text-sm font-bold tracking-wider uppercase font-mono" style={{ color: 'var(--text-secondary)' }}>
                profil_məlumatları
              </h3>
            </div>

            <div className="space-y-4">
              {/* Full name */}
              <div>
                <label className="block text-xs font-mono mb-2 tracking-wider uppercase" style={{ color: 'var(--text-secondary)' }}>
                  // ad_soyad
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs" style={{ color: 'var(--accent-primary)', opacity: 0.7 }}>
                    &gt;
                  </span>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input-field pl-8 font-mono text-sm"
                    placeholder="Ad Soyad"
                  />
                </div>
              </div>

              {/* Email (disabled) */}
              <div>
                <label className="block text-xs font-mono mb-2 tracking-wider uppercase" style={{ color: 'var(--text-secondary)' }}>
                  // email_adresi
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs" style={{ color: 'rgba(99,102,241,0.35)' }}>
                    @
                  </span>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="input-field pl-8 font-mono text-sm cursor-not-allowed"
                    style={{ opacity: 0.45 }}
                  />
                </div>
              </div>
            </div>

            {/* Save row */}
            <div className="flex items-center gap-4 mt-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary flex items-center gap-2"
                style={{ padding: '0.6rem 1.4rem' }}
              >
                {saving ? (
                  <>
                    <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="font-mono tracking-wider text-sm">SAXLANILIR...</span>
                  </>
                ) : (
                  <>
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-mono tracking-wider text-sm">SAXLA</span>
                  </>
                )}
              </button>

              {message && (
                <div
                  className="flex items-center gap-1.5 text-xs font-mono fade-in"
                  style={{ color: message === 'success' ? '#4ade80' : '#f87171' }}
                >
                  <span>{message === 'success' ? '✓' : '⚠'}</span>
                  <span>{message === 'success' ? 'Dəyişikliklər saxlanıldı' : 'Xəta baş verdi'}</span>
                </div>
              )}
            </div>
          </div>

          {/* ── Plan section ── */}
          <div
            className="rounded-2xl p-6 relative overflow-hidden"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid rgba(99,102,241,0.18)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, var(--accent-secondary), transparent)' }}
            />

            <div className="flex items-center gap-2 mb-5">
              <span className="font-mono text-xs" style={{ color: 'var(--accent-primary)' }}>//</span>
              <h3 className="text-sm font-bold tracking-wider uppercase font-mono" style={{ color: 'var(--text-secondary)' }}>
                abunəlik_planı
              </h3>
            </div>

            <div
              className="flex items-center justify-between p-4 rounded-xl"
              style={{
                background: planColor.bg,
                border: `1px solid ${planColor.border}`,
              }}
            >
              <div>
                <p className="font-bold font-mono text-sm capitalize" style={{ color: planColor.text }}>
                  {user?.plan} Plan
                </p>
                <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  {user?.plan === 'max'
                    ? '// limitsiz_istifadə'
                    : `// ${user?.tokens_used}/${user?.tokens_limit} token_istifadə`}
                </p>
              </div>
              <span
                className="px-3 py-1 rounded-lg text-xs font-black font-mono tracking-wider text-white"
                style={{ background: planColor.badge }}
              >
                {user?.plan?.toUpperCase()}
              </span>
            </div>

            {/* Token usage bar */}
            {user?.plan !== 'max' && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                    // token_istifadəsi
                  </span>
                  <span
                    className="text-xs font-mono font-bold"
                    style={{ color: tokenPct > 80 ? '#f87171' : 'var(--accent-primary)' }}
                  >
                    {tokenPct.toFixed(0)}%
                  </span>
                </div>
                <div
                  className="w-full h-2 rounded-full overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${tokenPct}%`,
                      background: tokenPct > 80
                        ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                        : 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
                      boxShadow: tokenPct > 80
                        ? '0 0 8px rgba(239,68,68,0.4)'
                        : '0 0 8px rgba(99,102,241,0.4)',
                    }}
                  />
                </div>
                <p className="text-xs font-mono" style={{ color: 'rgba(148,163,184,0.4)' }}>
                  {user?.tokens_used} / {user?.tokens_limit} token
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
