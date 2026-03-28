import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { redirectToCheckout } from '../services/stripeService'

const plans = [
  {
    id: 'free',
    name: 'Free',
    cmd: 'plan.free()',
    price: '$0',
    period: 'həmişəlik',
    tokens: '50 token/ay',
    features: [
      '50 AI sorğu/ay',
      'Əsas kibertəhlükəsizlik sualları',
      'Email dəstək',
    ],
    badge: null,
    accent: 'rgba(255,255,255,0.12)',
    accentBorder: 'rgba(255,255,255,0.12)',
    accentText: 'var(--text-secondary)',
    btnStyle: {
      background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.15)',
      color: 'var(--text-primary)',
    },
    btnHover: {
      background: 'rgba(255,255,255,0.14)',
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    cmd: 'plan.pro()',
    price: '$9.99',
    period: '/ay',
    tokens: '500 token/ay',
    features: [
      '7 gün pulsuz sınaq',
      '500 AI sorğu/ay',
      'Ətraflı pentest təlimatları',
      'Priority dəstək',
      'Tarix saxlama',
    ],
    badge: '7 GÜN PULSUZ',
    accent: 'rgba(99,102,241,0.12)',
    accentBorder: 'rgba(99,102,241,0.45)',
    accentText: '#a5b4fc',
    btnStyle: {
      background: 'linear-gradient(135deg, #6366f1, #9333ea)',
      border: 'none',
      color: 'white',
    },
    btnHover: {},
  },
  {
    id: 'max',
    name: 'Max',
    cmd: 'plan.max()',
    price: '$29.99',
    period: '/ay',
    tokens: 'Limitsiz',
    features: [
      'Limitsiz AI sorğu',
      'GPT-4 səviyyəli model',
      'Bütün pentest alətləri',
      '7/24 prioritet dəstək',
      'API giriş',
      'Xüsusi hesabat',
    ],
    badge: 'ƏN POPULYAR',
    accent: 'rgba(139,92,246,0.12)',
    accentBorder: 'rgba(139,92,246,0.45)',
    accentText: '#c084fc',
    btnStyle: {
      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      border: 'none',
      color: 'white',
    },
    btnHover: {},
  },
]

export default function PricingPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const handlePlan = (planId: string) => {
    if (planId === 'free') return
    if (!user) { navigate('/register'); return }
    redirectToCheckout(planId as 'pro' | 'max', user.email)
  }

  return (
    <div
      className="min-h-screen py-16 px-4 relative overflow-hidden cyber-grid"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Orbs */}
      <div
        className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'float 7s ease-in-out infinite',
        }}
      />
      <div
        className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'float 9s ease-in-out infinite reverse',
        }}
      />
      <div className="scan-line absolute inset-0 pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">

        {/* Header */}
        <div className="text-center mb-14 fade-in">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 font-mono text-xs tracking-widest"
            style={{
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.3)',
              color: 'var(--accent-primary)',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: 'var(--accent-primary)', boxShadow: '0 0 6px var(--accent-primary)' }}
            />
            // pricing.config
          </div>

          <h1
            className="text-4xl md:text-5xl font-black mb-4"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Plan{' '}
            <span className="gradient-text">Seçin</span>
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            Kibertəhlükəsizlik biliklərini limitsiz əldə edin
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 fade-in">
          {plans.map((plan) => {
            const isCurrent = user?.plan === plan.id

            return (
              <div
                key={plan.id}
                className="relative rounded-2xl p-6 flex flex-col transition-all duration-300"
                style={{
                  background: plan.id === 'free' ? 'var(--bg-secondary)' : plan.accent,
                  border: `1px solid ${plan.accentBorder}`,
                  boxShadow: plan.id !== 'free'
                    ? `0 8px 40px ${plan.accent}`
                    : '0 8px 32px rgba(0,0,0,0.25)',
                }}
              >
                {/* Top accent line */}
                <div
                  className="absolute top-0 left-0 right-0 h-px rounded-t-2xl"
                  style={{
                    background: plan.id === 'free'
                      ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)'
                      : `linear-gradient(90deg, transparent, ${plan.accentBorder}, transparent)`,
                  }}
                />

                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-black font-mono tracking-wider"
                      style={{
                        background: plan.id === 'pro'
                          ? 'linear-gradient(135deg, #6366f1, #9333ea)'
                          : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                        color: 'white',
                        boxShadow: plan.id === 'pro'
                          ? '0 4px 14px rgba(99,102,241,0.5)'
                          : '0 4px 14px rgba(139,92,246,0.5)',
                      }}
                    >
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Plan name + cmd */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-1">
                    <h3
                      className="text-xl font-black"
                      style={{ color: plan.accentText, fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {plan.name}
                    </h3>
                    {isCurrent && (
                      <span
                        className="text-xs font-mono px-2 py-0.5 rounded-lg"
                        style={{
                          background: 'rgba(74,222,128,0.12)',
                          border: '1px solid rgba(74,222,128,0.3)',
                          color: '#4ade80',
                        }}
                      >
                        aktiv
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-xs" style={{ color: 'rgba(148,163,184,0.45)' }}>
                    &gt; {plan.cmd}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-5">
                  <div className="flex items-baseline gap-1">
                    <span
                      className="text-4xl font-black"
                      style={{ color: plan.id === 'free' ? 'var(--text-primary)' : plan.accentText, fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {plan.price}
                    </span>
                    <span className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>
                      {plan.period}
                    </span>
                  </div>
                  <p className="text-xs font-mono mt-1" style={{ color: 'rgba(148,163,184,0.5)' }}>
                    {plan.tokens}
                  </p>
                </div>

                {/* Divider */}
                <div
                  className="h-px mb-5"
                  style={{ background: `rgba(255,255,255,0.07)` }}
                />

                {/* Features */}
                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm font-mono">
                      <span
                        className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 text-xs"
                        style={{
                          background: plan.id === 'free'
                            ? 'rgba(255,255,255,0.07)'
                            : `${plan.accent}`,
                          border: `1px solid ${plan.accentBorder}`,
                          color: plan.id === 'free' ? 'var(--text-secondary)' : plan.accentText,
                        }}
                      >
                        ✓
                      </span>
                      <span style={{ color: 'var(--text-secondary)' }}>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* Button */}
                <button
                  onClick={() => handlePlan(plan.id)}
                  disabled={isCurrent || plan.id === 'free' && !user}
                  className="w-full py-3 rounded-xl font-black font-mono text-sm tracking-wider transition-all duration-200"
                  style={{
                    ...plan.btnStyle,
                    opacity: isCurrent ? 0.5 : 1,
                    cursor: isCurrent ? 'not-allowed' : 'pointer',
                    boxShadow: plan.id !== 'free' && !isCurrent
                      ? `0 4px 20px ${plan.accent}`
                      : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (isCurrent) return
                    const el = e.currentTarget
                    if (plan.id !== 'free') {
                      el.style.transform = 'translateY(-1px)'
                      el.style.boxShadow = `0 8px 25px ${plan.accent}`
                    } else {
                      el.style.background = 'rgba(255,255,255,0.14)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget
                    el.style.transform = ''
                    if (plan.id !== 'free') {
                      el.style.boxShadow = `0 4px 20px ${plan.accent}`
                    } else {
                      el.style.background = 'rgba(255,255,255,0.08)'
                    }
                  }}
                >
                  {isCurrent
                    ? '✓ CARİ PLAN'
                    : plan.id === 'free'
                    ? 'PULSUZ BAŞLA'
                    : 'PLANI SEÇ →'}
                </button>
              </div>
            )
          })}
        </div>

        {/* Footer note */}
        <p
          className="text-center mt-10 font-mono text-xs"
          style={{ color: 'rgba(148,163,184,0.3)' }}
        >
          // Bütün planlar Stripe ilə təhlükəsiz ödəniş · İstənilən vaxt ləğv edilə bilər
        </p>
      </div>
    </div>
  )
}
