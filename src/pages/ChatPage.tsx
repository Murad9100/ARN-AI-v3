/**
 * ARN AI — NEURAL CHAT INTERFACE v7.0
 * Real Claude API integration — no more mock responses.
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { sendMessage } from '../services/aiService'

// ─────────────────────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────────────────────

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
}

interface Star {
  x: number; y: number; z: number
  size: number; bright: number; twOff: number
  r: number; g: number; b: number
}

interface Particle {
  x: number; y: number; vx: number; vy: number
  life: number; max: number; size: number; hue: number
}

interface Arc {
  pts: [number, number][]; life: number; max: number
}

interface Shockwave {
  x: number; y: number; r: number; maxR: number; alpha: number
}

// ─────────────────────────────────────────────────────────────────────────────
//  Canvas Factory Helpers
// ─────────────────────────────────────────────────────────────────────────────

function mkStar(w: number, h: number): Star {
  const palettes = [
    [255, 255, 255], [199, 210, 254], [191, 219, 254],
    [221, 214, 254], [252, 231, 243], [186, 230, 253],
  ]
  const c = palettes[Math.floor(Math.random() * palettes.length)]
  return {
    x: Math.random() * w, y: Math.random() * h,
    z: Math.random() * 3 + 0.3,
    size: Math.random() * 1.8 + 0.2,
    bright: Math.random() * 0.7 + 0.3,
    twOff: Math.random() * Math.PI * 2,
    r: c[0], g: c[1], b: c[2],
  }
}

function mkParticle(cx: number, cy: number): Particle {
  const angle = Math.random() * Math.PI * 2
  const dist = Math.random() * 250 + 30
  return {
    x: cx + Math.cos(angle) * dist,
    y: cy + Math.sin(angle) * dist,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    life: Math.random() * 200,
    max: Math.random() * 300 + 150,
    size: Math.random() * 2 + 0.3,
    hue: Math.random() * 80 + 210,
  }
}

function mkArc(cx: number, cy: number): Arc {
  const pts: [number, number][] = [[cx, cy]]
  const a = Math.random() * Math.PI * 2
  let x = cx, y = cy
  for (let i = 0; i < 7; i++) {
    const da = (Math.random() - 0.5) * 1.4
    const step = 15 + Math.random() * 25
    x += Math.cos(a + da * i) * step
    y += Math.sin(a + da * i) * step
    pts.push([x, y])
  }
  return { pts, life: 0, max: Math.random() * 35 + 10 }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Claude API Call
// ─────────────────────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────────────────────
//  Suggestions
// ─────────────────────────────────────────────────────────────────────────────

const SUGGESTIONS = [
  'CIA triad nədir?',
  'Nmap ilə port scan necə aparılır?',
  'SQL Injection nədir və necə qarşısı alınır?',
  'XSS hücumu nədir?',
]

// ─────────────────────────────────────────────────────────────────────────────
//  Code Block
// ─────────────────────────────────────────────────────────────────────────────

function CodeBlock({ language, value }: { language: string; value: string }) {
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
      background: 'rgba(0,0,0,0.5)', width: '100%',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 14px',
        background: 'rgba(99,102,241,0.08)',
        borderBottom: '1px solid rgba(99,102,241,0.2)',
      }}>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: '#818cf8', letterSpacing: 2 }}>
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
      <SyntaxHighlighter
        language={language || 'bash'}
        style={oneDark}
        customStyle={{ margin: 0, padding: '14px', background: 'transparent', fontSize: '0.8rem', lineHeight: 1.65 }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  Markdown Renderer
// ─────────────────────────────────────────────────────────────────────────────

function MarkdownMessage({ content }: { content: string }) {
  return (
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
}

// ─────────────────────────────────────────────────────────────────────────────
//  Thinking Animation
// ─────────────────────────────────────────────────────────────────────────────

function ThinkingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0' }}>
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
}

// ─────────────────────────────────────────────────────────────────────────────
//  Error Banner
// ─────────────────────────────────────────────────────────────────────────────

function ErrorBanner({ msg, onDismiss }: { msg: string; onDismiss: () => void }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '8px 14px', borderRadius: 8, margin: '0 0 10px',
      background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
      fontSize: 10, letterSpacing: 1, color: '#f87171', fontFamily: "'Space Mono', monospace",
    }}>
      <span>⚠ {msg}</span>
      <button onClick={onDismiss} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 12 }}>✕</button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [chats, setChats] = useState<ChatSession[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef(0)
  const tickRef = useRef(0)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const starsRef = useRef<Star[]>([])
  const particlesRef = useRef<Particle[]>([])
  const arcsRef = useRef<Arc[]>([])
  const clickFX = useRef<Shockwave[]>([])

  const currentChat = chats.find(c => c.id === currentChatId) || null

  // ── Initialize first chat ──────────────────────────────────────────────
  useEffect(() => {
    const id = Date.now().toString()
    const newChat: ChatSession = { id, title: 'Yeni Söhbət', messages: [], createdAt: new Date() }
    setChats([newChat])
    setCurrentChatId(id)
  }, [])

  // ── Scroll ─────────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentChat?.messages])

  // ── Auto-resize textarea ───────────────────────────────────────────────
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 128) + 'px'
  }, [input])

  // ── Canvas seed ────────────────────────────────────────────────────────
  useEffect(() => {
    const w = window.innerWidth, h = window.innerHeight
    starsRef.current = Array.from({ length: 400 }, () => mkStar(w, h))
    particlesRef.current = Array.from({ length: 25 }, () => mkParticle(w / 2, h / 2))
  }, [])

  // ── Canvas render loop ────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext('2d')!

    const resize = () => {
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
    }
    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(container)

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw)
      const w = canvas.width, h = canvas.height
      if (w === 0 || h === 0) return
      const cx = w / 2, cy = h / 2
      tickRef.current += 0.008
      const t = tickRef.current
      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      ctx.fillStyle = 'rgba(1,1,12,0.25)'
      ctx.fillRect(0, 0, w, h)

      const nebs = [
        { dx: -0.3, dy: -0.2, r: 0.45, hue: 241, a: 0.04 },
        { dx: 0.25, dy: 0.15, r: 0.35, hue: 270, a: 0.035 },
        { dx: 0.0, dy: -0.3, r: 0.28, hue: 195, a: 0.03 },
      ]
      nebs.forEach(n => {
        const px = (mx - 0.5) * 12, py = (my - 0.5) * 12
        const nx = cx + n.dx * w + px, ny = cy + n.dy * h + py
        const nr = n.r * w
        const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr)
        g.addColorStop(0, `hsla(${n.hue},75%,55%,${n.a})`)
        g.addColorStop(0.5, `hsla(${n.hue},65%,45%,${n.a * 0.4})`)
        g.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = g
        ctx.fillRect(0, 0, w, h)
      })

      starsRef.current.forEach(s => {
        const px = (mx - 0.5) * s.z * 20, py = (my - 0.5) * s.z * 20
        const tw = 0.65 + Math.sin(t * 1.8 + s.twOff) * 0.35
        const alpha = s.bright * tw
        const sx = s.x + px, sy = s.y + py
        if (sx < -10 || sx > w + 10 || sy < -10 || sy > h + 10) return
        ctx.globalAlpha = alpha * 0.7
        ctx.fillStyle = `rgb(${s.r},${s.g},${s.b})`
        ctx.beginPath()
        ctx.arc(sx, sy, s.size * tw, 0, Math.PI * 2)
        ctx.fill()
        if (s.size > 1.4) {
          const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, s.size * 3.5)
          halo.addColorStop(0, `rgba(${s.r},${s.g},${s.b},${alpha * 0.2})`)
          halo.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.fillStyle = halo
          ctx.beginPath()
          ctx.arc(sx, sy, s.size * 3.5, 0, Math.PI * 2)
          ctx.fill()
        }
      })
      ctx.globalAlpha = 1

      particlesRef.current.forEach(p => {
        const dx = cx + (mx - 0.5) * 40 - p.x
        const dy = cy + (my - 0.5) * 40 - p.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        p.vx += dx / dist * 0.001; p.vy += dy / dist * 0.001
        p.vx *= 0.985; p.vy *= 0.985
        p.x += p.vx; p.y += p.vy; p.life++
        if (p.life >= p.max) Object.assign(p, mkParticle(cx, cy))
        const prog = p.life / p.max
        const pa = Math.sin(prog * Math.PI) * 0.4
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue},75%,70%,${pa})`
        ctx.fill()
      })

      if (Math.random() < 0.02 && arcsRef.current.length < 5) {
        arcsRef.current.push(mkArc(Math.random() * w, Math.random() * h))
      }
      arcsRef.current = arcsRef.current.filter(a => a.life < a.max)
      ctx.save()
      ctx.shadowBlur = 4; ctx.shadowColor = '#c7d2fe'
      arcsRef.current.forEach(arc => {
        arc.life++
        const aAlpha = Math.sin((arc.life / arc.max) * Math.PI) * 0.4
        ctx.strokeStyle = `rgba(199,210,254,${aAlpha})`
        ctx.lineWidth = 0.4
        ctx.beginPath()
        arc.pts.forEach(([x, y], i) => { i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y) })
        ctx.stroke()
      })
      ctx.restore()

      clickFX.current = clickFX.current.filter(s => s.alpha > 0.008)
      clickFX.current.forEach(s => {
        s.r += (s.maxR - s.r) * 0.09; s.alpha *= 0.92
        for (let ring = 0; ring < 3; ring++) {
          const rr = s.r - ring * 15; if (rr < 0) continue
          ctx.beginPath(); ctx.arc(s.x, s.y, rr, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(99,102,241,${s.alpha * (1 - ring * 0.25)})`
          ctx.lineWidth = 1.2 - ring * 0.3; ctx.stroke()
        }
      })

      const vig = ctx.createRadialGradient(cx, cy, Math.min(w, h) * 0.4, cx, cy, Math.max(w, h) * 0.9)
      vig.addColorStop(0, 'rgba(0,0,0,0)')
      vig.addColorStop(1, 'rgba(0,0,8,0.55)')
      ctx.fillStyle = vig
      ctx.fillRect(0, 0, w, h)
    }

    draw()
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect() }
  }, [])

  // ── Mouse tracking ────────────────────────────────────────────────────
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX / window.innerWidth
      mouseRef.current.y = e.clientY / window.innerHeight
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  // ── Click shockwave ────────────────────────────────────────────────────
  const onBgClick = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    clickFX.current.push({
      x: e.clientX - rect.left, y: e.clientY - rect.top,
      r: 4, maxR: 160, alpha: 0.7,
    })
    if (clickFX.current.length > 8) clickFX.current.shift()
  }, [])

  // ── Create new chat ────────────────────────────────────────────────────
  const createNewChat = () => {
    const id = Date.now().toString()
    const newChat: ChatSession = { id, title: 'Yeni Söhbət', messages: [], createdAt: new Date() }
    setChats(prev => [newChat, ...prev])
    setCurrentChatId(id)
    setSidebarOpen(false)
    setError(null)
  }

  // ── Delete chat ────────────────────────────────────────────────────────
  const deleteChat = (id: string) => {
    setChats(prev => {
      const updated = prev.filter(c => c.id !== id)
      if (currentChatId === id) {
        if (updated.length > 0) {
          setCurrentChatId(updated[0].id)
        } else {
          const newId = Date.now().toString()
          const nc: ChatSession = { id: newId, title: 'Yeni Söhbət', messages: [], createdAt: new Date() }
          setCurrentChatId(newId)
          return [nc]
        }
      }
      return updated
    })
  }

  // ── Send message — REAL API ────────────────────────────────────────────
  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    setError(null)

    let chatId = currentChatId
    if (!chatId) {
      const id = Date.now().toString()
      const nc: ChatSession = { id, title: 'Yeni Söhbət', messages: [], createdAt: new Date() }
      setChats(prev => [nc, ...prev])
      chatId = id
      setCurrentChatId(id)
    }

    const userInput = input.trim()
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userInput,
      timestamp: new Date(),
    }
    setInput('')
    setIsLoading(true)

    // Add user message & set title on first message
    setChats(prev => prev.map(c =>
      c.id !== chatId ? c : {
        ...c,
        title: c.messages.length === 0
          ? userInput.slice(0, 32) + (userInput.length > 32 ? '…' : '')
          : c.title,
        messages: [...c.messages, userMsg],
      }
    ))

    // Add empty assistant placeholder
    const aId = (Date.now() + 1).toString()
    const aMsg: Message = { id: aId, role: 'assistant', content: '', timestamp: new Date() }
    setChats(prev => prev.map(c =>
      c.id !== chatId ? c : { ...c, messages: [...c.messages, aMsg] }
    ))

    try {
      // Build full conversation history
      const currentMessages = chats
        .find(c => c.id === chatId)?.messages
        .filter(m => m.content.trim())
        .map(m => ({ role: m.role, content: m.content })) || []

      const apiMessages = [...currentMessages, { role: 'user', content: userInput }]

      // Real Groq streaming via aiService.ts
      await sendMessage(
        apiMessages,
        (chunk: string) => {
          const cid = chatId
          const mid = aId
          setChats(prev => prev.map(c =>
            c.id !== cid ? c : {
              ...c,
              messages: c.messages.map(m =>
                m.id === mid ? { ...m, content: m.content + chunk } : m
              ),
            }
          ))
        },
        'free' // plan: authStore-dan gələcək, hələlik 'free'
      )
    } catch (err: any) {
      const errMsg = err?.message || 'Xəta baş verdi. Yenidən cəhd edin.'
      setError(errMsg)
      const mid = aId
      const cid = chatId
      setChats(prev => prev.map(c =>
        c.id !== cid ? c : {
          ...c,
          messages: c.messages.map(m =>
            m.id === mid ? { ...m, content: `⚠️ **Xəta:** ${errMsg}` } : m
          ),
        }
      ))
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const tokenUsed = currentChat?.messages.filter(m => m.role === 'user').length || 0
  const tokenLimit = 50
  const tokenPct = Math.min((tokenUsed / tokenLimit) * 100, 100)

  // ─────────────────────────────────────────────────────────────────────────
  //  JSX
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative', width: '100%', height: '100vh',
        background: '#01010c', overflow: 'hidden',
        fontFamily: "'Space Mono', monospace", display: 'flex', flexDirection: 'column',
      }}
      onClick={onBgClick}
    >
      <style>{`
        @keyframes neuralPulse { 0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1.2)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)} }
        @keyframes scanH { from{transform:translateX(-150%)}to{transform:translateX(500%)} }
        @keyframes corePulse { 0%,100%{box-shadow:0 0 12px rgba(99,102,241,.4),0 0 24px rgba(99,102,241,.15)}50%{box-shadow:0 0 25px rgba(99,102,241,.7),0 0 50px rgba(99,102,241,.25)} }
        @keyframes borderPulse { 0%,100%{opacity:.35}50%{opacity:.9} }
        @keyframes logoPulse { 0%,100%{box-shadow:0 0 18px rgba(99,102,241,.45)}50%{box-shadow:0 0 35px rgba(99,102,241,.8),0 0 60px rgba(99,102,241,.25)} }
        @keyframes statusBlink { 0%,100%{opacity:1}50%{opacity:.35} }
        @keyframes shimmer { from{background-position:200% 0}to{background-position:-200% 0} }
        @keyframes msgAppear { from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes glowRing { 0%,100%{box-shadow:0 0 8px rgba(99,102,241,.3)}50%{box-shadow:0 0 20px rgba(99,102,241,.6),0 0 40px rgba(99,102,241,.2)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .msg-appear{animation:msgAppear .4s cubic-bezier(.16,1,.3,1) both}
        textarea::placeholder{color:rgba(148,163,184,.35);font-family:'Space Mono',monospace;font-size:11px;letter-spacing:1px}
        textarea{scrollbar-width:none}
        textarea::-webkit-scrollbar{display:none}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(99,102,241,.2);border-radius:4px}
        ::-webkit-scrollbar-thumb:hover{background:rgba(99,102,241,.4)}
      `}</style>

      {/* Canvas */}
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }} />

      {/* Scanlines */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,200,180,.005) 3px,rgba(0,200,180,.005) 4px)' }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', backgroundImage: 'linear-gradient(90deg,rgba(255,0,128,.008) 0%,transparent 30%,transparent 70%,rgba(0,255,255,.008) 100%)' }} />

      {/* ── SIDEBAR ── */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(1,1,12,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSidebarOpen(false)} />
      )}

      <div onClick={e => e.stopPropagation()} style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: 300, zIndex: 90,
        background: 'rgba(2,2,16,0.96)', borderRight: '1px solid rgba(99,102,241,0.15)',
        backdropFilter: 'blur(30px)', display: 'flex', flexDirection: 'column',
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1)', overflow: 'hidden',
      }}>
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(99,102,241,0.12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#6366f1,#9333ea)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 18px rgba(99,102,241,.5)', animation: 'logoPulse 2.5s ease-in-out infinite' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: 3, background: 'linear-gradient(135deg,#818cf8,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ARN AI</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', color: 'rgba(255,255,255,.4)', width: 28, height: 28, borderRadius: 6, cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,80,80,.12)'; e.currentTarget.style.borderColor = 'rgba(255,80,80,.4)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.1)' }}>✕</button>
          </div>
          <button onClick={createNewChat} style={{ width: '100%', padding: '10px 14px', borderRadius: 9, background: 'linear-gradient(135deg,rgba(99,102,241,.15),rgba(139,92,246,.1))', border: '1px solid rgba(99,102,241,.4)', color: 'white', cursor: 'pointer', fontSize: 9, letterSpacing: 3, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all .25s cubic-bezier(.16,1,.3,1)', boxShadow: '0 0 16px rgba(99,102,241,.15)' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 28px rgba(99,102,241,.4)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 16px rgba(99,102,241,.15)'; e.currentTarget.style.transform = 'translateY(0)' }}>
            <span style={{ fontSize: 12 }}>⚡</span><span>YENİ SÖHBƏT</span>
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
          <div style={{ fontSize: 8, letterSpacing: 3, color: 'rgba(129,140,248,.4)', padding: '8px 8px 6px' }}>// session.history</div>
          {chats.map(chat => (
            <div key={chat.id} onClick={() => { setCurrentChatId(chat.id); setSidebarOpen(false) }}
              style={{ padding: '10px 12px', borderRadius: 8, marginBottom: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: chat.id === currentChatId ? 'rgba(99,102,241,.12)' : 'transparent', border: `1px solid ${chat.id === currentChatId ? 'rgba(99,102,241,.3)' : 'transparent'}`, transition: 'all .2s' }}
              onMouseEnter={e => { if (chat.id !== currentChatId) e.currentTarget.style.background = 'rgba(99,102,241,.06)' }}
              onMouseLeave={e => { if (chat.id !== currentChatId) e.currentTarget.style.background = 'transparent' }}>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'rgba(129,140,248,.5)', fontSize: 10, flexShrink: 0 }}>▸</span>
                <span style={{ fontSize: 10, letterSpacing: 1, color: chat.id === currentChatId ? '#a5b4fc' : 'rgba(148,163,184,.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chat.title}</span>
              </div>
              {chats.length > 1 && (
                <button onClick={e => { e.stopPropagation(); deleteChat(chat.id) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(148,163,184,.3)', fontSize: 10, padding: '2px 4px', borderRadius: 4, transition: 'all .2s', flexShrink: 0 }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248,113,113,.1)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(148,163,184,.3)'; e.currentTarget.style.background = 'none' }}>✕</button>
              )}
            </div>
          ))}
        </div>

        <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(99,102,241,.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px #4ade80', display: 'inline-block', animation: 'statusBlink 2s ease-in-out infinite' }} />
            <span style={{ fontSize: 8, letterSpacing: 2, color: 'rgba(99,102,241,.5)' }}>CORE ACTIVE</span>
          </div>
          <div style={{ fontSize: 7, letterSpacing: 2, color: 'rgba(99,102,241,.3)', lineHeight: 2 }}>
            <div>ARN.AI NEURAL ENGINE v7.0</div>
            <div>SESSIONS: {chats.length}</div>
          </div>
        </div>
      </div>

      {/* ── MAIN CHAT ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 2, height: '100%', width: '100%' }}>

        {/* Top Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid rgba(99,102,241,.1)', background: 'rgba(1,1,12,.8)', backdropFilter: 'blur(20px)', position: 'relative', zIndex: 10 }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(99,102,241,.3),transparent)', animation: 'borderPulse 3s ease-in-out infinite' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={e => { e.stopPropagation(); setSidebarOpen(true) }}
              style={{ background: 'rgba(99,102,241,.08)', border: '1px solid rgba(99,102,241,.25)', color: '#818cf8', width: 36, height: 36, borderRadius: 9, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .25s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,.15)'; e.currentTarget.style.boxShadow = '0 0 16px rgba(99,102,241,.3)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,.08)'; e.currentTarget.style.boxShadow = 'none' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="15" y2="12" /><line x1="3" y1="18" x2="18" y2="18" />
              </svg>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#6366f1,#9333ea)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 18px rgba(99,102,241,.45)', animation: 'logoPulse 2.5s ease-in-out infinite' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 3, background: 'linear-gradient(135deg,#818cf8,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ARN AI</div>
                <div style={{ fontSize: 7, letterSpacing: 3, color: 'rgba(129,140,248,.4)', marginTop: 1 }}>// neural.chat.interface</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: 'rgba(99,102,241,.06)', border: '1px solid rgba(99,102,241,.15)' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px #4ade80', display: 'inline-block', animation: 'statusBlink 1.8s ease-in-out infinite' }} />
              <span style={{ fontSize: 7, letterSpacing: 2, color: 'rgba(129,140,248,.6)' }}>ONLINE</span>
            </div>
            <button onClick={e => { e.stopPropagation(); createNewChat() }}
              style={{ background: 'linear-gradient(135deg,rgba(99,102,241,.15),rgba(139,92,246,.1))', border: '1px solid rgba(99,102,241,.35)', color: '#a5b4fc', height: 36, borderRadius: 9, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px', fontSize: 9, letterSpacing: 2, fontWeight: 700, transition: 'all .25s cubic-bezier(.16,1,.3,1)' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 24px rgba(99,102,241,.4)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>YENİ</span>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Empty state */}
          {(!currentChat || currentChat.messages.length === 0) && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', gap: 14, animation: 'fadeUp .8s cubic-bezier(.16,1,.3,1) both' }}>
              <div style={{ width: 80, height: 80, borderRadius: 22, background: 'rgba(99,102,241,.08)', border: '1px solid rgba(99,102,241,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'corePulse 2.5s ease-in-out infinite', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', border: '1px solid rgba(99,102,241,.1)', animation: 'glowRing 3s ease-in-out infinite' }} />
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
              </div>
              <div>
                <div style={{ fontSize: 8, letterSpacing: 4, color: 'rgba(129,140,248,.45)', marginBottom: 8 }}>// neural.core.active</div>
                <div style={{ fontSize: 28, fontWeight: 700, background: 'linear-gradient(135deg,#818cf8,#c084fc)', backgroundSize: '200% 100%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: 4, animation: 'shimmer 3s linear infinite' }}>ARN AI</div>
                <div style={{ fontSize: 9, letterSpacing: 3, color: 'rgba(148,163,184,.4)', marginTop: 6 }}>// kibertəhlükəsizlik_assistantı</div>
              </div>
              <p style={{ maxWidth: 380, lineHeight: 1.8, fontSize: 10, letterSpacing: 1, color: 'rgba(148,163,184,.5)' }}>
                Penetration testing, etik hacking və kibertəhlükəsizlik haqqında suallarınızı soruşun.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12, width: '100%', maxWidth: 480 }}>
                {SUGGESTIONS.map(q => (
                  <button key={q} onClick={e => { e.stopPropagation(); setInput(q) }}
                    style={{ padding: '12px 14px', borderRadius: 10, cursor: 'pointer', background: 'rgba(4,4,22,.85)', border: '1px solid rgba(99,102,241,.18)', color: 'rgba(148,163,184,.55)', fontSize: 9, letterSpacing: 1, textAlign: 'left', lineHeight: 1.7, backdropFilter: 'blur(10px)', transition: 'all .3s cubic-bezier(.16,1,.3,1)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,.5)'; e.currentTarget.style.color = '#a5b4fc'; e.currentTarget.style.background = 'rgba(99,102,241,.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(99,102,241,.15)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,.18)'; e.currentTarget.style.color = 'rgba(148,163,184,.55)'; e.currentTarget.style.background = 'rgba(4,4,22,.85)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
                    <span style={{ color: '#818cf8', marginRight: 6, opacity: 0.7 }}>▸</span>{q}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 24, marginTop: 20, fontSize: 7, letterSpacing: 2, color: 'rgba(99,102,241,.3)' }}>
                <span>CLAUDE API</span><span>·</span><span>NEURAL ENGINE</span><span>·</span><span>v7.0</span>
              </div>
            </div>
          )}

          {/* Message list */}
          {currentChat?.messages.map((message, idx) => (
            <div key={message.id} className="msg-appear" style={{
              animationDelay: `${Math.min(idx * 0.03, 0.3)}s`,
              display: 'flex', gap: 10,
              justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
              alignItems: 'flex-start', maxWidth: '100%',
            }}>
              {message.role === 'assistant' && (
                <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, marginTop: 2, background: 'rgba(99,102,241,.1)', border: '1px solid rgba(99,102,241,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 14px rgba(99,102,241,.2)', position: 'relative' }}>
                  {isLoading && idx === (currentChat?.messages.length || 0) - 1 && (
                    <div style={{ position: 'absolute', inset: -3, borderRadius: '50%', border: '1px solid transparent', borderTopColor: '#818cf8', animation: 'spin 2s linear infinite' }} />
                  )}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                </div>
              )}

              <div style={{
                maxWidth: message.role === 'user' ? '72%' : '82%',
                padding: message.role === 'user' ? '10px 16px' : '12px 16px',
                borderRadius: 14, position: 'relative', overflow: 'hidden',
                ...(message.role === 'user' ? {
                  background: 'linear-gradient(135deg,rgba(99,102,241,.18),rgba(139,92,246,.12))',
                  border: '1px solid rgba(99,102,241,.3)', borderBottomRightRadius: 4,
                  color: '#e2e8f0', fontSize: '0.88rem', lineHeight: 1.65,
                  boxShadow: '0 0 20px rgba(99,102,241,.08)',
                } : {
                  background: 'rgba(4,4,22,.88)',
                  border: '1px solid rgba(99,102,241,.15)', borderBottomLeftRadius: 4,
                  backdropFilter: 'blur(20px)', boxShadow: '0 0 25px rgba(99,102,241,.06)',
                }),
              }}>
                {message.role === 'assistant' && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(99,102,241,.35),transparent)' }} />}
                {message.role === 'user' && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(139,92,246,.3),transparent)' }} />}
                {message.role === 'assistant'
                  ? (message.content ? <MarkdownMessage content={message.content} /> : <ThinkingDots />)
                  : message.content}
              </div>

              {message.role === 'user' && (
                <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, marginTop: 2, background: 'linear-gradient(135deg,#6366f1,#9333ea)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: 'white', boxShadow: '0 0 14px rgba(99,102,241,.35)', border: '1px solid rgba(255,255,255,.15)' }}>U</div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ padding: '12px 20px 18px', borderTop: '1px solid rgba(99,102,241,.1)', background: 'rgba(1,1,12,.9)', backdropFilter: 'blur(30px)', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(99,102,241,.15),transparent)' }} />

          {error && <ErrorBanner msg={error} onDismiss={() => setError(null)} />}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, padding: '0 2px' }}>
            <span style={{ fontSize: 8, letterSpacing: 2, color: 'rgba(129,140,248,.35)' }}>// messages: {tokenUsed}/{tokenLimit}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 80, height: 2, borderRadius: 2, background: 'rgba(255,255,255,.05)', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 2, width: `${tokenPct}%`, background: tokenPct > 80 ? 'linear-gradient(90deg,#f59e0b,#ef4444)' : 'linear-gradient(90deg,#6366f1,#9333ea)', transition: 'width .5s', boxShadow: tokenPct > 80 ? '0 0 6px rgba(239,68,68,.5)' : '0 0 6px rgba(99,102,241,.5)' }} />
              </div>
              <span style={{ fontSize: 7, letterSpacing: 2, color: tokenPct > 80 ? 'rgba(239,68,68,.5)' : 'rgba(99,102,241,.3)' }}>{Math.round(tokenPct)}%</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', padding: '10px 14px', borderRadius: 14, background: 'rgba(4,4,22,.9)', border: '1px solid rgba(99,102,241,.22)', transition: 'all .3s cubic-bezier(.16,1,.3,1)', position: 'relative', overflow: 'hidden', boxShadow: '0 0 20px rgba(99,102,241,.05)' }}
            onFocusCapture={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,.5)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(99,102,241,.12),inset 0 0 30px rgba(99,102,241,.03)' }}
            onBlurCapture={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,.22)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(99,102,241,.05)' }}>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(99,102,241,.25),transparent)', animation: 'scanH 3s linear infinite', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: 5, left: 5, width: 6, height: 6, borderLeft: '1px solid rgba(99,102,241,.2)', borderTop: '1px solid rgba(99,102,241,.2)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: 5, right: 5, width: 6, height: 6, borderRight: '1px solid rgba(99,102,241,.2)', borderTop: '1px solid rgba(99,102,241,.2)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: 5, left: 5, width: 6, height: 6, borderLeft: '1px solid rgba(99,102,241,.2)', borderBottom: '1px solid rgba(99,102,241,.2)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: 5, right: 5, width: 6, height: 6, borderRight: '1px solid rgba(99,102,241,.2)', borderBottom: '1px solid rgba(99,102,241,.2)', pointerEvents: 'none' }} />

            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onClick={e => e.stopPropagation()}
              placeholder="// sualınızı yazın...  (Enter → göndər)"
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', resize: 'none', color: '#e2e8f0', fontFamily: "'Space Mono', monospace", fontSize: '0.88rem', lineHeight: 1.6, minHeight: 22, maxHeight: 128, caretColor: '#818cf8' }}
              rows={1}
            />

            <button onClick={e => { e.stopPropagation(); handleSend() }}
              disabled={isLoading || !input.trim()}
              style={{ flexShrink: 0, width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer', transition: 'all .3s cubic-bezier(.16,1,.3,1)', border: 'none', position: 'relative', ...(isLoading || !input.trim() ? { background: 'rgba(99,102,241,.06)', color: 'rgba(99,102,241,.25)' } : { background: 'linear-gradient(135deg,#6366f1,#9333ea)', color: 'white', boxShadow: '0 0 22px rgba(99,102,241,.4)' }) }}
              onMouseEnter={e => { if (!isLoading && input.trim()) { e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)'; e.currentTarget.style.boxShadow = '0 0 35px rgba(99,102,241,.6)' } }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = isLoading || !input.trim() ? 'none' : '0 0 22px rgba(99,102,241,.4)' }}>
              {isLoading ? (
                <svg style={{ animation: 'spin 1s linear infinite', width: 15, height: 15 }} viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 8, fontSize: 7, letterSpacing: 2, color: 'rgba(148,163,184,.18)' }}>
            <span>AZTU</span><span style={{ color: 'rgba(99,102,241,.2)' }}>·</span><span>CYBERSEC DEPT</span><span style={{ color: 'rgba(99,102,241,.2)' }}>·</span><span>REDBOARD v1.0</span>
          </div>
        </div>
      </div>

      {/* HUD Overlays */}
      <div style={{ position: 'absolute', bottom: 12, left: 12, zIndex: 3, fontSize: 7, letterSpacing: 2, color: 'rgba(99,102,241,.2)', lineHeight: 2, pointerEvents: 'none' }}>
        <div>NEURAL.CORE ▸ ONLINE</div>
        <div>LATENCY ▸ &lt;12ms</div>
      </div>
      <div style={{ position: 'absolute', bottom: 12, right: 12, zIndex: 3, fontSize: 7, letterSpacing: 2, color: 'rgba(99,102,241,.2)', lineHeight: 2, textAlign: 'right', pointerEvents: 'none' }}>
        <div>UPTIME ▸ 99.97%</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 4px #4ade80', display: 'inline-block', animation: 'statusBlink 2s ease-in-out infinite' }} />
          CORE ACTIVE
        </div>
      </div>
    </div>
  )
}
