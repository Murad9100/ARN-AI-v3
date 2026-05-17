import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useChatStore } from '../store/chatStore'

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  const { user, signOut } = useAuthStore()
  const { chats, currentChatId, addChat, setCurrentChat, deleteChat } = useChatStore()
  const navigate = useNavigate()
  const location = useLocation()

  // Ekran ölçüsü dəyişdikdə isMobile state-ni yenilə
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Mobildə başlanğıcda sidebar bağlı olsun
  useEffect(() => {
    setSidebarOpen(!isMobile)
  }, []) // eslint-disable-line

  // Mobildə route dəyişəndə sidebar bağlansın
  useEffect(() => {
    if (isMobile) setSidebarOpen(false)
  }, [location.pathname, isMobile])

  const handleNewChat = async () => {
    if (user) {
      const id = await addChat(user.id)
      navigate('/chat')
      setCurrentChat(id)
    }
    if (isMobile) setSidebarOpen(false)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const handleChatSelect = (id: string) => {
    setCurrentChat(id)
    navigate('/chat')
    if (isMobile) setSidebarOpen(false)
  }

  const tokenPct = user ? Math.min((user.tokens_used / user.tokens_limit) * 100, 100) : 0

  const pageLabel =
    location.pathname === '/chat'
      ? 'chat_session'
      : location.pathname === '/settings'
      ? 'parametrlər'
      : location.pathname === '/pricing'
      ? 'pricing'
      : 'arn_ai'

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* ── Mobil overlay (sidebar açıqsa qaraldır) ─── */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 z-20 md:hidden"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────── */}
      <div
        className="flex flex-col flex-shrink-0 transition-all duration-300 overflow-hidden z-30 h-full"
        style={{
          width: sidebarOpen ? '256px' : '0px',
          background: 'var(--bg-secondary)',
          borderRight: '1px solid rgba(99,102,241,0.15)',
          position: isMobile ? 'fixed' : 'relative',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-4 py-5 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(99,102,241,0.12)' }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
            style={{
              background: 'rgba(99,102,241,0.12)',
              border: '1px solid rgba(99,102,241,0.3)',
              boxShadow: '0 0 18px rgba(99,102,241,0.18)',
              color: 'var(--accent-primary)',
            }}
          >
            ⚡
          </div>
          <div className="min-w-0">
            <p
              className="text-sm font-black gradient-text tracking-wider whitespace-nowrap"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              ARN AI
            </p>
            <p className="text-xs whitespace-nowrap" style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>
              // cyber_assistant
            </p>
          </div>
        </div>

        {/* New Chat */}
        <div className="px-3 pt-4 pb-2 flex-shrink-0">
          <button
            onClick={handleNewChat}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(139,92,246,0.12))',
              border: '1px solid rgba(99,102,241,0.3)',
              color: 'var(--accent-primary)',
              boxShadow: '0 2px 12px rgba(99,102,241,0.1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99,102,241,0.28), rgba(139,92,246,0.2))'
              e.currentTarget.style.boxShadow = '0 4px 18px rgba(99,102,241,0.22)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(139,92,246,0.12))'
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(99,102,241,0.1)'
            }}
          >
            <span style={{ fontSize: '1rem', lineHeight: 1 }}>+</span>
            Yeni Söhbət
          </button>
        </div>

        {/* Section label */}
        <p
          className="px-4 pt-3 pb-1 text-xs uppercase tracking-widest flex-shrink-0"
          style={{ color: 'var(--text-secondary)', opacity: 0.4 }}
        >
          // tarixçə
        </p>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
          {chats.length === 0 && (
            <p
              className="text-xs px-3 py-4 text-center"
              style={{ color: 'var(--text-secondary)', opacity: 0.35 }}
            >
              // söhbət yoxdur
            </p>
          )}
          {chats.map((chat) => {
            const isActive = currentChatId === chat.id
            return (
              <div
                key={chat.id}
                onClick={() => handleChatSelect(chat.id)}
                className="group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-xs transition-all"
                style={{
                  background: isActive ? 'rgba(99,102,241,0.14)' : 'transparent',
                  border: isActive ? '1px solid rgba(99,102,241,0.28)' : '1px solid transparent',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                    e.currentTarget.style.color = 'var(--text-primary)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                  }
                }}
              >
                <span className="truncate flex-1 flex items-center gap-2">
                  <span style={{ opacity: 0.5 }}>&gt;</span>
                  <span className="truncate">{chat.title}</span>
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteChat(chat.id) }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-xs flex-shrink-0"
                  style={{ color: 'rgba(239,68,68,0.7)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(239,68,68,0.7)')}
                >
                  ✕
                </button>
              </div>
            )
          })}
        </div>

        {/* User Info */}
        <div
          className="p-3 flex-shrink-0"
          style={{ borderTop: '1px solid rgba(99,102,241,0.12)' }}
        >
          {user?.plan === 'free' && (
            <div className="mb-3 px-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs" style={{ color: 'var(--text-secondary)', opacity: 0.55 }}>
                  <span style={{ color: 'var(--accent-primary)' }}>//</span> token
                </span>
                <span className="text-xs" style={{ color: 'var(--text-secondary)', opacity: 0.55 }}>
                  {user.tokens_used}/{user.tokens_limit}
                </span>
              </div>
              <div
                className="w-full h-1 rounded-full overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.07)' }}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${tokenPct}%`,
                    background:
                      tokenPct > 80
                        ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                        : 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
                  }}
                />
              </div>
            </div>
          )}

          <div
            className="flex items-center gap-2.5 p-2.5 rounded-xl mb-2"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                color: 'white',
                boxShadow: '0 0 10px rgba(99,102,241,0.3)',
              }}
            >
              {user?.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                {user?.full_name}
              </p>
              <p className="text-xs capitalize" style={{ color: 'var(--accent-primary)', opacity: 0.8 }}>
                {user?.plan === 'max' ? '∞ max plan' : `${user?.plan} plan`}
              </p>
            </div>
          </div>

          <div className="flex gap-1.5">
            <button
              onClick={() => { navigate('/settings'); if (isMobile) setSidebarOpen(false); }}
              className="flex-1 py-1.5 text-xs rounded-xl transition-all"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                color: 'var(--text-secondary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(99,102,241,0.1)'
                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'
                e.currentTarget.style.color = 'var(--accent-primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                e.currentTarget.style.color = 'var(--text-secondary)'
              }}
            >
              ⚙ parametr
            </button>
            <button
              onClick={handleSignOut}
              className="flex-1 py-1.5 text-xs rounded-xl transition-all"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                color: 'rgba(239,68,68,0.6)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.08)'
                e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)'
                e.currentTarget.style.color = '#ef4444'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                e.currentTarget.style.color = 'rgba(239,68,68,0.6)'
              }}
            >
              ⏻ çıxış
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 w-full">
        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 h-14 flex-shrink-0"
          style={{
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid rgba(99,102,241,0.12)',
          }}
        >
          {/* Hamburger */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex flex-col gap-1 p-1.5 rounded-lg transition-all flex-shrink-0"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            <span className="block w-4 h-px" style={{ background: 'currentColor' }} />
            <span className="block w-3 h-px" style={{ background: 'currentColor' }} />
            <span className="block w-4 h-px" style={{ background: 'currentColor' }} />
          </button>

          {/* Page label */}
          <div className="flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{
                background: 'var(--accent-primary)',
                boxShadow: '0 0 6px var(--accent-primary)',
              }}
            />
            <span
              className="text-xs"
              style={{ color: 'var(--text-secondary)', fontFamily: "'JetBrains Mono', monospace" }}
            >
              <span style={{ color: 'var(--accent-primary)' }}>//</span> {pageLabel}
            </span>
          </div>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-2">
            {user?.plan === 'free' && (
              <button
                onClick={() => navigate('/pricing')}
                className="text-xs px-3 py-1.5 rounded-lg transition-all font-semibold whitespace-nowrap"
                style={{
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(139,92,246,0.12))',
                  border: '1px solid rgba(99,102,241,0.3)',
                  color: 'var(--accent-primary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #6366f1, #9333ea)'
                  e.currentTarget.style.color = 'white'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(99,102,241,0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(139,92,246,0.12))'
                  e.currentTarget.style.color = 'var(--accent-primary)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                ⚡ upgrade
              </button>
            )}
            {user?.plan !== 'free' && (
              <span
                className="text-xs px-2.5 py-1 rounded-lg whitespace-nowrap"
                style={{
                  background: 'rgba(99,102,241,0.1)',
                  border: '1px solid rgba(99,102,241,0.2)',
                  color: 'var(--accent-primary)',
                }}
              >
                ✓ {user?.plan?.toUpperCase()}
              </span>
            )}
            <span
              className="text-xs hidden sm:inline"
              style={{ color: 'var(--text-secondary)', opacity: 0.5 }}
            >
              {user?.plan === 'max' ? '∞' : `${user?.tokens_used}/${user?.tokens_limit}`}
              <span style={{ opacity: 0.5 }}> tkn</span>
            </span>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
