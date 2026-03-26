import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const FEATURES = [
  {
    icon: '🚀',
    cmd: 'speed.init()',
    title: 'Sürətli Cavablar',
    desc: 'Groq API ilə milisaniyələr içində real-time AI cavabları alın',
  },
  {
    icon: '🛡️',
    cmd: 'pentest.load()',
    title: 'Pentest Eksperti',
    desc: 'Nmap, Burp Suite, Metasploit kimi alətlər haqqında dərin bilgi',
  },
  {
    icon: '💰',
    cmd: 'plan.select()',
    title: 'Əlverişli Qiymət',
    desc: 'Pulsuz plandan limitsiz plana qədər sizə uyğun variant',
  },
]

const CHECKS = ['Pulsuz plan', 'Real-time AI', 'Pentest bilgiləri']

export default function LandingPage() {
  const { user } = useAuthStore()

  return (
    <div
      className="min-h-screen text-white overflow-x-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Fixed cyber grid */}
      <div className="fixed inset-0 cyber-grid opacity-40 pointer-events-none" />

      {/* Background orbs */}
      <div
        className="fixed top-[-15%] left-[-5%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'float 8s ease-in-out infinite',
        }}
      />
      <div
        className="fixed bottom-[-20%] right-[-5%] w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'float 10s ease-in-out infinite reverse',
        }}
      />

      {/* Scan line */}
      <div className="scan-line fixed inset-0 pointer-events-none" />

      {/* ── Navbar ─────────────────────────────────────── */}
      <nav
        className="relative z-20 container mx-auto px-6 py-5 flex justify-between items-center"
        style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl animate-glow"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #9333ea)',
              boxShadow: '0 0 20px rgba(99,102,241,0.4)',
            }}
          >
            ⚡
          </div>
          <span
            className="text-2xl font-black gradient-text"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            ARN AI
          </span>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <Link to="/chat" className="btn-primary flex items-center gap-2 text-sm">
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="font-mono tracking-wider">DASHBOARD</span>
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn-secondary text-sm font-mono tracking-wider">
                GİRİŞ
              </Link>
              <Link to="/register" className="btn-primary text-sm font-mono tracking-wider">
                QEYDİYYAT
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────── */}
      <section className="relative z-10 container mx-auto px-6 pt-24 pb-28 text-center fade-in">

        {/* Status badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 font-mono text-xs tracking-widest"
          style={{
            background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.3)',
            color: 'var(--accent-primary)',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: '#4ade80',
              boxShadow: '0 0 8px #4ade80',
              animation: 'pulse-glow 2s infinite',
            }}
          />
          POWERED BY ADVANCED AI · ONLINE
        </div>

        {/* Headline */}
        <h1
          className="text-5xl md:text-7xl font-black mb-6 leading-tight"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          Kibertəhlükəsizlik<br />
          üçün{' '}
          <span className="gradient-text animate-gradient">
            AI Köməkçiniz
          </span>
        </h1>

        <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Penetration testing, etik hacking və network security sahəsində
          peşəkar AI assistenti. Groq API ilə gücləndirilmiş, sürətli və dəqiq cavablar.
        </p>

        {/* CTA buttons */}
        <div className="flex gap-4 justify-center flex-wrap mb-12">
          <Link
            to="/register"
            className="btn-primary flex items-center gap-2 text-base px-8 py-4"
          >
            <span>⚡</span>
            <span className="font-mono tracking-wider">PULSUZ BAŞLA</span>
          </Link>
          <Link
            to="/pricing"
            className="btn-secondary flex items-center gap-2 text-base px-8 py-4"
          >
            <span>💎</span>
            <span className="font-mono tracking-wider">PLANLAR</span>
          </Link>
        </div>

        {/* Check items */}
        <div className="flex justify-center gap-8 flex-wrap">
          {CHECKS.map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>
              <span style={{ color: '#4ade80' }}>✓</span>
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ───────────────────────────────────── */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <p className="font-mono text-xs tracking-widest mb-3" style={{ color: 'var(--accent-primary)' }}>
            // feature_list
          </p>
          <h2 className="text-3xl md:text-4xl font-black" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            Niyə{' '}
            <span className="gradient-text">ARN AI</span>?
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl p-6 transition-all duration-300 relative overflow-hidden group"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid rgba(99,102,241,0.15)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget
                el.style.borderColor = 'rgba(99,102,241,0.4)'
                el.style.transform = 'translateY(-4px)'
                el.style.boxShadow = '0 16px 40px rgba(99,102,241,0.15)'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget
                el.style.borderColor = 'rgba(99,102,241,0.15)'
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)'
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'linear-gradient(90deg, transparent, var(--accent-primary), transparent)' }}
              />

              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                style={{
                  background: 'rgba(99,102,241,0.12)',
                  border: '1px solid rgba(99,102,241,0.25)',
                }}
              >
                {f.icon}
              </div>

              <p className="font-mono text-xs mb-2" style={{ color: 'var(--accent-primary)', opacity: 0.7 }}>
                &gt; {f.cmd}
              </p>
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────── */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <div
          className="rounded-3xl p-12 text-center relative overflow-hidden"
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid rgba(99,102,241,0.2)',
            boxShadow: '0 0 60px rgba(99,102,241,0.08)',
          }}
        >
          {/* Inner gradient */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 60%)',
            }}
          />
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, var(--accent-primary), var(--accent-secondary), transparent)' }}
          />

          <div className="relative z-10">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 font-mono text-xs tracking-widest"
              style={{
                background: 'rgba(99,102,241,0.1)',
                border: '1px solid rgba(99,102,241,0.3)',
                color: 'var(--accent-primary)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-primary)', boxShadow: '0 0 6px var(--accent-primary)' }} />
              BAŞLAMAĞA HAZIRSINIZ?
            </div>

            <h2
              className="text-4xl md:text-5xl font-black mb-4"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              <span className="gradient-text">Hazırsınız?</span>
            </h2>
            <p className="mb-8 text-lg max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Kibertəhlükəsizlik biliklərini AI ilə əldə edin
            </p>
            <Link
              to="/register"
              className="btn-primary inline-flex items-center gap-2 text-base px-10 py-4"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="font-mono tracking-wider">İNDİ BAŞLA</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer
        className="relative z-10 container mx-auto px-6 py-8"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className="text-lg font-black gradient-text"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              ARN AI
            </span>
          </div>
          <p className="font-mono text-xs" style={{ color: 'rgba(148,163,184,0.35)' }}>
            © 2024 ARN AI · AZTU CyberSec Dept · REDBOARD v1.0
          </p>
          <div className="flex items-center gap-1.5 font-mono text-xs" style={{ color: 'rgba(148,163,184,0.35)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#4ade80', boxShadow: '0 0 4px #4ade80' }} />
            system online
          </div>
        </div>
      </footer>
    </div>
  )
}
