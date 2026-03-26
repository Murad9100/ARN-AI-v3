import { useState, useRef, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { useChatStore } from '../store/chatStore'
import { sendMessage } from '../services/aiService'
import type { Message } from '../types'

export default function ChatPage() {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { user, fetchProfile } = useAuthStore()
  const { getCurrentChat, addMessage, addChat, currentChatId, setCurrentChat } = useChatStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const currentChat = getCurrentChat()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentChat?.messages])

  useEffect(() => {
    if (!currentChatId) {
      const id = addChat()
      setCurrentChat(id)
    }
  }, [])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const canSend = user?.plan === 'max' || (user?.tokens_used ?? 0) < (user?.tokens_limit ?? 0)
    if (!canSend) {
      alert('Token limitiniz dolub! Planınızı yüksəldin.')
      return
    }

    const chatId = currentChatId || addChat()
    if (!currentChatId) setCurrentChat(chatId)

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    addMessage(chatId, userMessage)
    setInput('')
    setIsLoading(true)

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    }
    addMessage(chatId, assistantMessage)

    const chat = getCurrentChat()
    const history = (chat?.messages || [])
      .filter((m) => m.id !== assistantMessage.id)
      .map((m) => ({ role: m.role, content: m.content }))

    try {
      await sendMessage(history, (chunk) => {
        const { chats } = useChatStore.getState()
        const updated = chats.map((c) => {
          if (c.id !== chatId) return c
          return {
            ...c,
            messages: c.messages.map((m) =>
              m.id === assistantMessage.id
                ? { ...m, content: m.content + chunk }
                : m
            ),
          }
        })
        useChatStore.setState({ chats: updated })
      })
      await fetchProfile()
    } catch {
      const { chats } = useChatStore.getState()
      const updated = chats.map((c) => {
        if (c.id !== chatId) return c
        return {
          ...c,
          messages: c.messages.map((m) =>
            m.id === assistantMessage.id
              ? { ...m, content: 'Xəta baş verdi. Yenidən cəhd edin.' }
              : m
          ),
        }
      })
      useChatStore.setState({ chats: updated })
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

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!currentChat?.messages.length && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-6xl mb-4">⚡</div>
            <h2 className="text-2xl font-bold text-[#00ff88] mb-2">ARN AI</h2>
            <p className="text-gray-400 max-w-md">
              Kibertəhlükəsizlik, penetration testing, etik hacking haqqında suallarınızı soruşun.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6 max-w-lg w-full">
              {[
                'Nmap ilə port scan necə aparılır?',
                'SQL injection nədir?',
                'Burp Suite ilə web test',
                'XSS hücumu nədir?',
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="p-3 text-sm text-left bg-white/5 hover:bg-[#00ff88]/10 border border-white/10 hover:border-[#00ff88]/30 rounded-lg text-gray-400 hover:text-[#00ff88] transition-all"
                >
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
              <div className="w-8 h-8 rounded-full bg-[#00ff88]/20 flex items-center justify-center text-[#00ff88] text-sm flex-shrink-0">
                ⚡
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                message.role === 'user'
                  ? 'bg-[#00ff88]/20 text-white border border-[#00ff88]/30'
                  : 'bg-white/5 text-gray-200 border border-white/10'
              } ${message.role === 'assistant' && !message.content ? 'typing-cursor' : ''}`}
            >
              {message.content || (isLoading ? '' : 'Cavab yüklənir...')}
            </div>
            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-sm flex-shrink-0">
                {user?.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#00ff88]/20 bg-[#0d1117]">
        {user?.plan === 'free' && (
          <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
            <span>Token: {user.tokens_used}/{user.tokens_limit}</span>
            <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#00ff88] rounded-full transition-all"
                style={{ width: `${Math.min((user.tokens_used / user.tokens_limit) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
        <div className="flex gap-3 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Sualınızı yazın... (Enter - göndər, Shift+Enter - yeni sətir)"
            className="flex-1 bg-white/5 border border-white/10 focus:border-[#00ff88]/50 rounded-xl px-4 py-3 text-white text-sm resize-none focus:outline-none transition-colors min-h-[48px] max-h-32"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-4 py-3 bg-[#00ff88] text-black font-bold rounded-xl hover:bg-[#00ff88]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '...' : '➤'}
          </button>
        </div>
      </div>
    </div>
  )
}