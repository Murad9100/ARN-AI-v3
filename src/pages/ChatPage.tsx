import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
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

// Kod bloku komponenti
const CodeBlock = ({ language, value }: { language: string; value: string }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-xl overflow-hidden my-3" style={{ border: '1px solid rgba(99,102,241,0.25)' }}>
      {/* Kod başlığı */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ background: 'rgba(99,102,241,0.1)', borderBottom: '1px solid rgba(99,102,241,0.2)' }}
      >
        <span className="text-xs font-mono" style={{ color: 'var(--accent-primary)' }}>
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="text-xs px-2 py-1 rounded-lg transition-all font-mono"
          style={{
            background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(99,102,241,0.15)',
            color: copied ? '#4ade80' : 'var(--accent-primary)',
            border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'rgba(99,102,241,0.3)'}`,
          }}
        >
          {copied ? '✓ kopyalandı' : 'kopyala'}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || 'bash'}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: '1rem',
          background: 'rgba(0,0,0,0.4)',
          fontSize: '0.8rem',
          lineHeight: '1.6',
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  )
}

// Markdown renderer
const MarkdownMessage = ({ content }: { content: string }) => (
  <ReactMarkdown
    components={{
      code({ className, children, ...props }) {
        const match = /language-(\w+)/.exec(className || '')
        const isBlock = !!match
        return isBlock ? (
          <CodeBlock language={match[1]} value={String(children).replace(/\n$/, '')} />
        ) : (
          <code
            className="px-1.5 py-0.5 rounded text-xs font-mono"
            style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}
            {...props}
          >
            {children}
          </code>
        )
      },
      h1: ({ children }) => (
        <h1 className="text-xl font-bold mb-3 mt-4" style={{ color: 'var(--text-primary)' }}>{children}</h1>
      ),
      h2: ({ children }) => (
        <h2 className="text-lg font-bold mb-2 mt-3" style={{ color: 'var(--text-primary)' }}>{children}</h2>
      ),
      h3: ({ children }) => (
        <h3 className="text-base font-semibold mb-2 mt-3" style={{ color: '#a5b4fc' }}>{children}</h3>
      ),
      p: ({ children }) => (
        <p className="mb-2 leading-relaxed" style={{ color: '#cbd5e1' }}>{children}</p>
      ),
      ul: ({ children }) => (
        <ul className="mb-3 space-y-1" style={{ paddingLeft: '1.25rem' }}>{children}</ul>
      ),
      ol: ({ children }) => (
        <ol className="mb-3 space-y-1" style={{ paddingLeft: '1.25rem', listStyleType: 'decimal' }}>{children}</ol>
      ),
      li: ({ children }) => (
        <li className="text-sm leading-relaxed" style={{ color: '#cbd5e1', listStyleType: 'disc' }}>{children}</li>
      ),
      strong: ({ children }) => (
        <strong className="font-semibold" style={{ color: '#a5b4fc' }}>{children}</strong>
      ),
      blockquote: ({ children }) => (
        <blockquote
          className="pl-3 my-2 text-sm italic"
          style={{
            borderLeft: '3px solid var(--accent-primary)',
            color: 'var(--text-secondary)',
            background: 'rgba(99,102,241,0.05)',
            padding: '0.5rem 0.75rem',
            borderRadius: '0 0.5rem 0.5rem 0',
          }}
        >
          {children}
        </blockquote>
      ),
      hr: () => (
        <hr className="my-3" style={{ borderColor: 'rgba(99,102,241,0.2)' }} />
      ),
    }}
  >
    {content}
  </ReactMarkdown>
)

export default function ChatPage() {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { user, fetchProfile } = useAuthStore()
  const { getCurrentChat, addMessage, addChat, loadChats, currentChatId, setCurrentChat } = useChatStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const currentChat = getCurrentChat()

  useEffect(() => {
    if (user) loadChats(user.id)
  }, [user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentChat?.messages])

  useEffect(() => {
    if (!currentChatId && user) {
      addChat(user.id).then((id) => setCurrentChat(id))
    }
  }, [user])

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 128) + 'px'
  }, [input])

  const handleSend = async () => {
    if (!input.trim() || isLoading || !user) return

    const canSend = user.plan === 'max' || (user.tokens_used ?? 0) < (user.tokens_limit ?? 0)
    if (!canSend) {
      alert('Token limitiniz dolub! Planınızı yüksəldin.')
      return
    }

    let chatId = currentChatId
    if (!chatId) {
      chatId = await addChat(user.id)
      setCurrentChat(chatId)
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    await addMessage(chatId, userMessage)
    setInput('')
    setIsLoading(true)

    const assistantMessageId = (Date.now() + 1).toString()
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    }

    useChatStore.setState((state) => ({
      chats: state.chats.map((c) => {
        if (c.id !== chatId) return c
        return { ...c, messages: [...c.messages, assistantMessage] }
      }),
    }))

    const chat = getCurrentChat()
    const history = (chat?.messages || [])
      .filter((m) => m.id !== assistantMessageId)
      .map((m) => ({ role: m.role, content: m.content }))

    let finalContent = ''

    try {
      await sendMessage(history, (chunk) => {
        finalContent += chunk
        const { chats } = useChatStore.getState()
        useChatStore.setState({
          chats: chats.map((c) => {
            if (c.id !== chatId) return c
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantMessageId
                  ? { ...m, content: m.content + chunk }
                  : m
              ),
            }
          }),
        })
      })

      await supabase.from('messages').insert({
        id: assistantMessageId,
        chat_id: chatId,
        role: 'assistant',
        content: finalContent,
        timestamp: assistantMessage.timestamp.toISOString(),
      })

      await fetchProfile()
    } catch {
      const errorText = 'Xəta baş verdi. Yenidən cəhd edin.'
      finalContent = errorText
      const { chats } = useChatStore.getState()
      useChatStore.setState({
        chats: chats.map((c) => {
          if (c.id !== chatId) return c
          return {
            ...c,
            messages: c.messages.map((m) =>
              m.id === assistantMessageId ? { ...m, content: errorText } : m
            ),
          }
        }),
      })
      await supabase.from('messages').insert({
        id: assistantMessageId,
        chat_id: chatId,
        role: 'assistant',
        content: errorText,
        timestamp: assistantMessage.timestamp.toISOString(),
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const tokenPct = user ? Math.min((user.tokens_used / user.tokens_limit) * 100, 100) : 0

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-primary)' }}>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">

        {!currentChat?.messages.length && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 fade-in">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-1 animate-float"
              style={{
                background: 'rgba(99,102,241,0.12)',
                border: '1px solid rgba(99,102,241,0.3)',
                boxShadow: '0 0 30px rgba(99,102,241,0.15)',
              }}
            >
              ⚡
            </div>
            <h2 className="text-3xl font-black gradient-text" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              ARN AI
            </h2>
            <p className="font-mono text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
              // kibertəhlükəsizlik_assistantı
            </p>
            <p className="text-sm max-w-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Penetration testing, etik hacking və kibertəhlükəsizlik haqqında suallarınızı soruşun.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 w-full max-w-lg">
              {SUGGESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="p-3 text-xs text-left rounded-xl transition-all font-mono"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'var(--text-secondary)',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget
                    el.style.background = 'rgba(99,102,241,0.1)'
                    el.style.borderColor = 'rgba(99,102,241,0.35)'
                    el.style.color = '#a5b4fc'
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget
                    el.style.background = 'rgba(255,255,255,0.04)'
                    el.style.borderColor = 'rgba(255,255,255,0.08)'
                    el.style.color = 'var(--text-secondary)'
                  }}
                >
                  <span style={{ color: 'var(--accent-primary)', marginRight: '0.35rem' }}>&gt;</span>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {currentChat?.messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 fade-in ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0 mt-0.5"
                style={{
                  background: 'rgba(99,102,241,0.15)',
                  border: '1px solid rgba(99,102,241,0.3)',
                  color: 'var(--accent-primary)',
                  boxShadow: '0 0 12px rgba(99,102,241,0.15)',
                }}
              >
                ⚡
              </div>
            )}

            <div
              className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                message.role === 'user' ? 'max-w-[75%]' : 'max-w-[85%]'
              } ${message.role === 'assistant' && !message.content ? 'typing-cursor' : ''}`}
              style={
                message.role === 'user'
                  ? {
                      background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))',
                      border: '1px solid rgba(99,102,241,0.3)',
                      color: 'var(--text-primary)',
                      borderBottomRightRadius: '4px',
                    }
                  : {
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      color: '#cbd5e1',
                      borderBottomLeftRadius: '4px',
                    }
              }
            >
              {message.role === 'assistant' ? (
                message.content
                  ? <MarkdownMessage content={message.content} />
                  : <span className="typing-cursor" style={{ color: 'var(--text-secondary)' }} />
              ) : (
                message.content
              )}
            </div>

            {message.role === 'user' && (
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                  color: 'white',
                  boxShadow: '0 0 12px rgba(99,102,241,0.3)',
                }}
              >
                {user?.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        className="px-4 pt-3 pb-4"
        style={{
          borderTop: '1px solid rgba(99,102,241,0.15)',
          background: 'var(--bg-secondary)',
        }}
      >
        {user?.plan === 'free' && (
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="font-mono text-xs flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--accent-primary)' }}>//</span>
              token: {user.tokens_used}/{user.tokens_limit}
            </span>
            <div className="w-28 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${tokenPct}%`,
                  background: tokenPct > 80
                    ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                    : 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
                }}
              />
            </div>
          </div>
        )}

        <div
          className="flex gap-2 items-end rounded-2xl px-3 py-2"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(99,102,241,0.2)',
            transition: 'border-color 0.25s',
          }}
          onFocusCapture={(e) => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)')}
          onBlurCapture={(e) => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)')}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="// sualınızı yazın...  (Enter göndər · Shift+Enter yeni sətir)"
            className="flex-1 bg-transparent text-sm resize-none focus:outline-none py-1"
            style={{
              color: 'var(--text-primary)',
              fontFamily: "'JetBrains Mono', monospace",
              minHeight: '24px',
              maxHeight: '128px',
            }}
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{
              background: isLoading || !input.trim()
                ? 'rgba(99,102,241,0.15)'
                : 'linear-gradient(135deg, #6366f1, #9333ea)',
              color: isLoading || !input.trim() ? 'rgba(99,102,241,0.4)' : 'white',
              boxShadow: isLoading || !input.trim() ? 'none' : '0 4px 15px rgba(99,102,241,0.35)',
              cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
