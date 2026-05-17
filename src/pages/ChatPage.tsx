import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { useAuthStore } from '../store/authStore'
import { useChatStore } from '../store/chatStore'
import { sendMessage } from '../services/aiService'
import { supabase } from '../lib/supabase'
import type { Message } from '../types'

const SUGGESTIONS = [
  'Nmap ilə port scan necə aparılır?',
  'SQL injection nədir?',
  'Burp Suite ilə web test',
  'XSS hücumu nədir?',
]

// ── Code Block ────────────────────────────────────────────────────────────────
const CodeBlock = ({ language, value }: { language: string; value: string }) => {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div style={{
      borderRadius: 10, overflow: 'hidden', margin: '12px 0',
      border: '1px solid rgba(99,102,241,0.3)',
      background: 'rgba(0,0,0,0.5)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 14px',
        background: 'rgba(99,102,241,0.08)',
        borderBottom: '1px solid rgba(99,102,241,0.2)',
      }}>
        <span style={{
          fontFamily: "'Space Mono', monospace", fontSize: 9,
          color: '#818cf8', letterSpacing: 2,
        }}>
          // {language || 'code'}
        </span>
        <button onClick={handleCopy} style={{
          fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: 2,
          padding: '3px 10px', borderRadius: 6, cursor: 'pointer',
          background: copied ? 'rgba(74,222,128,0.12)' : 'rgba(99,102,241,0.12)',
          color: copied ? '#4ade80' : '#818cf8',
          border: `1px solid ${copied ? 'rgba(74,222,128,0.3)' : 'rgba(99,102,241,0.3)'}`,
          transition: 'all 0.2s',
        }}>
          {copied ? '✓ KOPYALANDI' : 'KOPYALA'}
        </button>
      </div>
      <pre style={{ margin: 0, padding: '14px', background: 'transparent', overflowX: 'auto' }}>
        <code style={{
          fontFamily: "'Space Mono', monospace", fontSize: '0.8rem', lineHeight: 1.65, 
          color: '#e2e8f0', whiteSpace: 'pre-wrap', wordBreak: 'break-word'
        }}>
          {value}
        </code>
      </pre>
    </div>
  )
}

// ── Markdown Renderer ─────────────────────────────────────────────────────────
const MarkdownMessage = ({ content }: { content: string }) => (
  <ReactMarkdown
    components={{
      code({ className, children, ...props }) {
        const match = /language-(\w+)/.exec(className || '')
        return match ? (
          <CodeBlock language={match[1]} value={String(children).replace(/\n$/, '')} />
        ) : (
          <code style={{
            background: 'rgba(99,102,241,0.15)', color: '#a5b4fc',
            fontFamily: "'Space Mono', monospace", fontSize: '0.8rem',
            padding: '2px 6px', borderRadius: 4,
          }} {...props}>{children}</code>
        )
      },
      h1: ({ children }) => <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#e2e8f0', margin: '1rem 0 0.5rem', letterSpacing: '-0.02em' }}>{children}</h1>,
      h2: ({ children }) => <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#e2e8f0', margin: '0.9rem 0 0.4rem' }}>{children}</h2>,
      h3: ({ children }) => <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#a5b4fc', margin: '0.8rem 0 0.35rem' }}>{children}</h3>,
      p: ({ children }) => <p style={{ marginBottom: '0.65rem', lineHeight: 1.75, color: '#cbd5e1', fontSize: '0.92rem' }}>{children}</p>,
      ul: ({ children }) => <ul style={{ marginBottom: '0.7rem', paddingLeft: '1.2rem' }}>{children}</ul>,
      ol: ({ children }) => <ol style={{ marginBottom: '0.7rem', paddingLeft: '1.2rem', listStyleType: 'decimal' }}>{children}</ol>,
      li: ({ children }) => <li style={{ color: '#cbd5e1', lineHeight: 1.7, fontSize: '0.92rem', marginBottom: '0.2rem', listStyleType: 'disc' }}>{children}</li>,
      strong: ({ children }) => <strong style={{ fontWeight: 700, color: '#e2e8f0' }}>{children}</strong>,
      blockquote: ({ children }) => (
        <blockquote style={{
          borderLeft: '2px solid #818cf8', color: '#94a3b8',
          background: 'rgba(99,102,241,0.06)', padding: '6px 12px',
          borderRadius: '0 6px 6px 0', margin: '8px 0', fontSize: '0.9rem',
        }}>{children}</blockquote>
      ),
      hr: () => <hr style={{ borderColor: 'rgba(99,102,241,0.2)', margin: '10px 0' }} />,
    }}
  >
    {content}
  </ReactMarkdown>
)

// ── Thinking Animation ────────────────────────────────────────────────────────
const ThinkingDots = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0' }}>
    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: 'rgba(129,140,248,0.5)', letterSpacing: 2 }}>
      // neural.processing
    </span>
    {[0, 1, 2].map(i => (
      <div key={i} style={{
        width: 5, height: 5, borderRadius: '50%',
        background: '#818cf8',
        animation: `neuralPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
        boxShadow: '0 0 6px #818cf8',
      }} />
    ))}
  </div>
)

// ── Main Component ────────────────────────────────────────────────────────────
export default function ChatPage() {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { user, fetchProfile } = useAuthStore()
  const { getCurrentChat, addMessage, addChat, loadChats, currentChatId, setCurrentChat } = useChatStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const currentChat = getCurrentChat()

  useEffect(() => { if (user) loadChats(user.id) }, [user])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [currentChat?.messages])
  useEffect(() => { if (!currentChatId && user) addChat(user.id).then(id => setCurrentChat(id)) }, [user])
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 128) + 'px'
  }, [input])
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('upgraded') === 'true') {
      fetchProfile()
      window.history.replaceState({}, '', '/chat')
      alert('🎉 Planınız uğurla yeniləndi!')
    }
  }, [])

  const handleSend = async () => {
    if (!input.trim() || isLoading || !user) return
    const canSend = user.plan === 'max' || (user.tokens_used ?? 0) < (user.tokens_limit ?? 0)
    if (!canSend) { alert('Token limitiniz dolub! Planınızı yüksəldin.'); return }

    let chatId = currentChatId
    if (!chatId) { chatId = await addChat(user.id); setCurrentChat(chatId) }

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input.trim(), timestamp: new Date() }
    await addMessage(chatId, userMessage)
    setInput('')
    setIsLoading(true)

    const assistantMessageId = (Date.now() + 1).toString()
    const assistantMessage: Message = { id: assistantMessageId, role: 'assistant', content: '', timestamp: new Date() }

    useChatStore.setState(state => ({
      chats: state.chats.map(c => c.id !== chatId ? c : { ...c, messages: [...c.messages, assistantMessage] })
    }))

    const chat = getCurrentChat()
    const history = (chat?.messages || []).filter(m => m.id !== assistantMessageId).map(m => ({ role: m.role, content: m.content }))
    let finalContent = ''

    try {
      await sendMessage(history, chunk => {
        finalContent += chunk
        const { chats } = useChatStore.getState()
        useChatStore.setState({
          chats: chats.map(c => c.id !== chatId ? c : {
            ...c,
            messages: c.messages.map(m => m.id === assistantMessageId ? { ...m, content: m.content + chunk } : m)
          })
        })
      }, user.plan)

      await supabase.from('messages').insert({
        id: assistantMessageId, chat_id: chatId, role: 'assistant',
        content: finalContent, timestamp: assistantMessage.timestamp.toISOString(),
      })
      await fetchProfile()
    } catch {
      const errorText = 'Xəta baş verdi. Yenidən cəhd edin.'
      finalContent = errorText
      const { chats } = useChatStore.getState()
      useChatStore.setState({
        chats: chats.map(c => c.id !== chatId ? c : {
          ...c,
          messages: c.messages.map(m => m.id === assistantMessageId ? { ...m, content: errorText } : m)
        })
      })
      await supabase.from('messages').insert({
        id: assistantMessageId, chat_id: chatId, role: 'assistant',
        content: errorText, timestamp: assistantMessage.timestamp.toISOString(),
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const tokenPct = user ? Math.min((user.tokens_used / user.tokens_limit) * 100, 100) : 0

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      width: '100%', flex: 1,
      background: '#01010c', position: 'relative', overflow: 'hidden',
    }}>

      {/* Keyframes */}
      <style>{`
        @keyframes neuralPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scanH {
          from { transform: translateX(-150%); }
          to { transform: translateX(500%); }
        }
        @keyframes corePulse {
          0%, 100% { box-shadow: 0 0 12px rgba(99,102,241,0.4), 0 0 24px rgba(99,102,241,0.15); }
          50% { box-shadow: 0 0 20px rgba(99,102,241,0.7), 0 0 40px rgba(99,102,241,0.25); }
        }
        .msg-appear { animation: fadeSlideIn 0.35s cubic-bezier(0.16,1,0.3,1) both; }
        textarea::placeholder { color: rgba(148,163,184,0.35); font-family: 'Space Mono', monospace; font-size: 11px; letter-spacing: 1px; }
        textarea { scrollbar-width: none; }
        textarea::-webkit-scrollbar { display: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.25); border-radius: 4px; }
      `}</style>

      {/* Background nebula */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.06) 0%, transparent 70%)',
      }} />

      {/* Scanlines */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,200,180,0.005) 3px, rgba(0,200,180,0.005) 4px)',
      }} />

      {/* Messages area */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '24px 20px',
        display: 'flex', flexDirection: 'column', gap: 16,
        position: 'relative', zIndex: 2,
      }}>

        {/* Empty state */}
        {!currentChat?.messages.length && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '100%', textAlign: 'center', gap: 14,
            animation: 'fadeSlideIn 0.6s cubic-bezier(0.16,1,0.3,1) both',
          }}>
            {/* Core icon */}
            <div style={{
              width: 72, height: 72, borderRadius: 20,
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'corePulse 2.5s ease-in-out infinite',
              marginBottom: 4,
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>

            <div>
              <div style={{
                fontFamily: "'Space Mono', monospace", fontSize: 9,
                color: 'rgba(129,140,248,0.5)', letterSpacing: 4, marginBottom: 8,
              }}>
                // neural.core.active
              </div>
              <div style={{
                fontFamily: "'Space Mono', monospace", fontSize: 26, fontWeight: 700,
                background: 'linear-gradient(135deg, #818cf8, #c084fc)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                letterSpacing: 3,
              }}>
                ARN AI
              </div>
              <div style={{
                fontFamily: "'Space Mono', monospace", fontSize: 9,
                color: 'rgba(148,163,184,0.45)', letterSpacing: 3, marginTop: 6,
              }}>
                // kibertəhlükəsizlik_assistantı
              </div>
            </div>

            <p style={{
              color: 'rgba(148,163,184,0.55)',
              maxWidth: 340, lineHeight: 1.7, marginTop: 4,
              fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: 1,
            }}>
              Penetration testing, etik hacking və kibertəhlükəsizlik haqqında suallarınızı soruşun.
            </p>

            {/* Suggestion chips */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: 8, marginTop: 8, width: '100%', maxWidth: 460,
            }}>
              {SUGGESTIONS.map(q => (
                <button key={q} onClick={() => setInput(q)} style={{
                  padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                  background: 'rgba(4,4,22,0.8)',
                  border: '1px solid rgba(99,102,241,0.2)',
                  color: 'rgba(148,163,184,0.6)',
                  fontFamily: "'Space Mono', monospace", fontSize: 9,
                  letterSpacing: 1, textAlign: 'left', lineHeight: 1.6,
                  transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
                  backdropFilter: 'blur(10px)',
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'
                    e.currentTarget.style.color = '#a5b4fc'
                    e.currentTarget.style.background = 'rgba(99,102,241,0.1)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)'
                    e.currentTarget.style.color = 'rgba(148,163,184,0.6)'
                    e.currentTarget.style.background = 'rgba(4,4,22,0.8)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <span style={{ color: '#818cf8', marginRight: 6 }}>&gt;</span>{q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {currentChat?.messages.map((message, idx) => (
          <div key={message.id} className="msg-appear" style={{
            animationDelay: `${idx * 0.03}s`,
            display: 'flex', gap: 10,
            justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
            alignItems: 'flex-start',
          }}>

            {/* AI Avatar */}
            {message.role === 'assistant' && (
              <div style={{
                width: 32, height: 32, borderRadius: 9, flexShrink: 0, marginTop: 2,
                background: 'rgba(99,102,241,0.12)',
                border: '1px solid rgba(99,102,241,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 12px rgba(99,102,241,0.2)',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
            )}

            {/* Message bubble */}
            <div style={{
              maxWidth: message.role === 'user' ? '72%' : '82%',
              padding: '10px 14px', borderRadius: 14,
              position: 'relative', overflow: 'hidden',
              ...(message.role === 'user' ? {
                background: 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(139,92,246,0.12))',
                border: '1px solid rgba(99,102,241,0.3)',
                borderBottomRightRadius: 4,
                color: '#e2e8f0',
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.88rem', lineHeight: 1.65,
              } : {
                background: 'rgba(4,4,22,0.85)',
                border: '1px solid rgba(99,102,241,0.18)',
                borderBottomLeftRadius: 4,
                backdropFilter: 'blur(20px)',
              }),
            }}>
              {/* Top accent line on AI messages */}
              {message.role === 'assistant' && (
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                  background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.4), transparent)',
                }} />
              )}

              {message.role === 'assistant' ? (
                message.content
                  ? <MarkdownMessage content={message.content} />
                  : <ThinkingDots />
              ) : (
                message.content
              )}
            </div>

            {/* User Avatar */}
            {message.role === 'user' && (
              <div style={{
                width: 32, height: 32, borderRadius: 9, flexShrink: 0, marginTop: 2,
                background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 12,
                color: 'white', boxShadow: '0 0 12px rgba(99,102,241,0.35)',
              }}>
                {user?.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div style={{
        padding: '12px 20px 18px',
        borderTop: '1px solid rgba(99,102,241,0.12)',
        background: 'rgba(1,1,12,0.95)',
        backdropFilter: 'blur(20px)',
        position: 'relative', zIndex: 2,
      }}>

        {/* Token bar */}
        {user?.plan === 'free' && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 10, padding: '0 2px',
          }}>
            <span style={{
              fontFamily: "'Space Mono', monospace", fontSize: 8,
              color: 'rgba(129,140,248,0.4)', letterSpacing: 2,
            }}>
              // token: {user.tokens_used}/{user.tokens_limit}
            </span>
            <div style={{ width: 80, height: 2, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 2,
                width: `${tokenPct}%`,
                background: tokenPct > 80
                  ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                  : 'linear-gradient(90deg, #6366f1, #9333ea)',
                transition: 'width 0.5s',
                boxShadow: tokenPct > 80 ? '0 0 6px rgba(239,68,68,0.5)' : '0 0 6px rgba(99,102,241,0.5)',
              }} />
            </div>
          </div>
        )}

        {/* Input box */}
        <div style={{
          display: 'flex', gap: 10, alignItems: 'flex-end',
          padding: '10px 14px', borderRadius: 14,
          background: 'rgba(4,4,22,0.9)',
          border: '1px solid rgba(99,102,241,0.25)',
          transition: 'border-color 0.3s',
          position: 'relative', overflow: 'hidden',
        }}
          onFocusCapture={e => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.55)')}
          onBlurCapture={e => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)')}
        >
          {/* Scan line on focus */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)',
            animation: 'scanH 3s linear infinite',
            pointerEvents: 'none',
          }} />

          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="// sualınızı yazın...  (Enter → göndər)"
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              resize: 'none', color: '#e2e8f0',
              fontFamily: "'Space Mono', monospace", fontSize: '0.88rem',
              lineHeight: 1.6, minHeight: 22, maxHeight: 128,
              caretColor: '#818cf8',
            }}
            rows={1}
          />

          <button onClick={handleSend}
            disabled={isLoading || !input.trim()}
            style={{
              flexShrink: 0, width: 36, height: 36, borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
              transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
              border: 'none',
              ...(isLoading || !input.trim() ? {
                background: 'rgba(99,102,241,0.08)',
                color: 'rgba(99,102,241,0.3)',
              } : {
                background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                color: 'white',
                boxShadow: '0 0 20px rgba(99,102,241,0.4)',
              }),
            }}
            onMouseEnter={e => {
              if (!isLoading && input.trim()) {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 0 30px rgba(99,102,241,0.6)'
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = isLoading || !input.trim() ? 'none' : '0 0 20px rgba(99,102,241,0.4)'
            }}
          >
            {isLoading ? (
              <svg style={{ animation: 'spin 1s linear infinite', width: 15, height: 15 }} viewBox="0 0 24 24" fill="none">
                <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
          </button>
        </div>

        {/* Footer hint */}
        <div style={{
          textAlign: 'center', marginTop: 8,
          fontFamily: "'Space Mono', monospace", fontSize: 8,
          color: 'rgba(148,163,184,0.2)', letterSpacing: 2,
        }}>
          AZTU · CyberSec Dept · REDBOARD v1.0
        </div>
      </div>
    </div>
  )
}
