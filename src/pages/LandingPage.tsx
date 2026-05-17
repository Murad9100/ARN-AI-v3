/**
 * ARN AI — SINGULARITY GATEWAY v6.0
 * Ultra-cinematic immersive landing page with procedural space,
 * morphing AI core, holographic authentication panels.
 *
 * Dependencies assumed in project:
 *   react, react-router-dom, (your existing authStore)
 *
 * No extra npm packages required — uses native Canvas 2D API.
 */

import { useRef, useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

// ─────────────────────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────────────────────

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
//  Factory helpers (defined outside component — no stale closures)
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
  const dist = Math.random() * 320 + 40
  return {
    x: cx + Math.cos(angle) * dist,
    y: cy + Math.sin(angle) * dist,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
    life: Math.random() * 200,
    max: Math.random() * 300 + 150,
    size: Math.random() * 2.5 + 0.5,
    hue: Math.random() * 80 + 210,
  }
}

function mkArc(cx: number, cy: number): Arc {
  const pts: [number, number][] = [[cx, cy]]
  const a = Math.random() * Math.PI * 2
  let x = cx, y = cy
  for (let i = 0; i < 9; i++) {
    const da = (Math.random() - 0.5) * 1.4
    const step = 20 + Math.random() * 35
    x += Math.cos(a + da * i) * step
    y += Math.sin(a + da * i) * step
    pts.push([x, y])
  }
  return { pts, life: 0, max: Math.random() * 35 + 10 }
}

// ─────────────────────────────────────────────────────────────────────────────
//  HoloInput sub-component
// ─────────────────────────────────────────────────────────────────────────────

function HoloInput({
  label, value, onChange, type, glitch, accent = '#818cf8',
}: {
  label: string; value: string; onChange: (v: string) => void
  type: string; glitch: boolean; accent?: string
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <label style={{
        display: 'block', fontFamily: "'Space Mono', monospace",
        fontSize: 8, letterSpacing: 3,
        color: focused ? accent : 'rgba(148,163,184,0.5)',
        marginBottom: 6, transition: 'color 0.3s',
        userSelect: 'none',
      }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onClick={e => e.stopPropagation()}
          autoComplete="off"
          aria-label={label}
          style={{
            width: '100%', background: 'transparent', border: 'none',
            borderBottom: `1px solid ${focused ? accent : 'rgba(99,102,241,0.3)'}`,
            color: 'white',
            fontFamily: "'Space Mono', monospace", fontSize: 13, letterSpacing: 2,
            padding: '8px 0 8px 0', outline: 'none',
            textShadow: focused ? `0 0 12px ${accent}` : 'none',
            boxShadow: focused
              ? `0 2px 0 ${accent}, 0 6px 20px rgba(99,102,241,0.25)`
              : '0 1px 0 rgba(99,102,241,0.15)',
            transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
            caretColor: accent,
            transform: glitch ? `translateX(${(Math.random() - 0.5) * 6}px)` : 'none',
            filter: glitch ? 'hue-rotate(20deg)' : 'none',
          }}
        />
        {focused && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
            background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
            animation: 'scanH 2s linear infinite',
            pointerEvents: 'none',
          }} />
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  Panel header sub-component
// ─────────────────────────────────────────────────────────────────────────────

function PanelHeader({
  nodeLabel, title, accent, onClose,
}: {
  nodeLabel: string; title: string; accent: string; onClose: () => void
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{
        height: 1,
        background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
        marginBottom: 18, animation: 'borderPulse 3s ease-in-out infinite',
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{
            fontFamily: "'Space Mono', monospace", fontSize: 9,
            color: accent, opacity: 0.65, letterSpacing: 3, marginBottom: 6,
          }}>{nodeLabel}</div>
          <div style={{
            fontFamily: "'Space Mono', monospace", fontSize: 20,
            fontWeight: 700, color: 'white', letterSpacing: 4,
          }}>{title}</div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close panel"
          style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.4)', width: 30, height: 30, borderRadius: 6,
            cursor: 'pointer', fontSize: 11, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Space Mono', monospace", transition: 'all 0.2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,80,80,0.12)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,80,80,0.4)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)' }}
        >✕</button>
      </div>
      <div style={{
        position: 'relative', height: 1,
        background: 'rgba(255,255,255,0.05)', marginTop: 16, overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '30%', height: '100%',
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
          animation: 'scanH 2.5s linear infinite',
        }} />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  // Canvas & animation refs
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef(0)
  const tickRef   = useRef(0)         // global frame ticker
  const fadeRef   = useRef(0)         // 0→1 fade-in value
  const phaseRef  = useRef(0)         // 0:black 1:revealing 2:active
  const successRef = useRef(false)
  const successTickRef = useRef(0)
  const glitchRef = useRef(false)
  const mouseRef  = useRef({ x: 0.5, y: 0.5 })
  const clickFX   = useRef<Shockwave[]>([])
  const starsRef  = useRef<Star[]>([])
  const particlesRef = useRef<Particle[]>([])
  const arcsRef   = useRef<Arc[]>([])

  // UI state
  const [phase, setPhase]   = useState(0)
  const [panel, setPanel]   = useState<'login' | 'register' | null>(null)
  const [success, setSuccess] = useState(false)
  const [glitch, setGlitch] = useState(false)
  const [errMsg, setErrMsg] = useState('')
  const [loading, setLoading] = useState(false)

  // Form fields
  const [lEmail, setLEmail] = useState('')
  const [lPw, setLPw]       = useState('')
  const [rName, setRName]   = useState('')
  const [rEmail, setREmail] = useState('')
  const [rPw, setRPw]       = useState('')

  const { user, login, register: registerUser } = useAuthStore()
  const navigate = useNavigate()

  // ── Opening sequence ──────────────────────────────────────────────────────
  useEffect(() => {
    if (user) { navigate('/chat'); return }
    const t1 = setTimeout(() => { phaseRef.current = 1; setPhase(1) }, 500)
    const t2 = setTimeout(() => { phaseRef.current = 2; setPhase(2) }, 2600)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, []) // eslint-disable-line

  // ── Canvas seed ───────────────────────────────────────────────────────────
  useEffect(() => {
    const w = window.innerWidth, h = window.innerHeight
    starsRef.current    = Array.from({ length: 900 }, () => mkStar(w, h))
    particlesRef.current = Array.from({ length: 55 }, () => mkParticle(w / 2, h / 2))
  }, [])

  // ── Main render loop ──────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw)
      const w = canvas.width, h = canvas.height
      const cx = w / 2, cy = h / 2
      tickRef.current += 0.012
      const t = tickRef.current
      const mx = mouseRef.current.x
      const my = mouseRef.current.y
      const ph = phaseRef.current

      // Advance fade-in
      if (ph >= 1) fadeRef.current = Math.min(1, fadeRef.current + 0.004)
      const fi = fadeRef.current   // shorthand

      // ── Background ─────────────────────────────────────────────────────
      // Motion-trail: semi-transparent fill creates comet-tail on stars
      ctx.fillStyle = ph === 0 ? '#01010c' : `rgba(1,1,12,${Math.max(0.12, 0.35 - fi * 0.2)})`
      ctx.fillRect(0, 0, w, h)

      if (ph === 0) return

      // ── Deep space nebulae ─────────────────────────────────────────────
      const nebs = [
        { dx: -0.28, dy: -0.18, r: 0.42, hue: 241, a: 0.055 },
        { dx:  0.22, dy:  0.14, r: 0.38, hue: 270, a: 0.045 },
        { dx:  0.05, dy: -0.28, r: 0.30, hue: 195, a: 0.040 },
        { dx: -0.12, dy:  0.20, r: 0.25, hue: 290, a: 0.035 },
        { dx:  0.35, dy: -0.10, r: 0.22, hue: 220, a: 0.030 },
      ]
      nebs.forEach(n => {
        const px = (mx - 0.5) * 18, py = (my - 0.5) * 18
        const nx = cx + n.dx * w + px
        const ny = cy + n.dy * h + py
        const nr = n.r * w
        const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr)
        g.addColorStop(0, `hsla(${n.hue},75%,55%,${n.a * fi})`)
        g.addColorStop(0.5, `hsla(${n.hue},65%,45%,${n.a * 0.4 * fi})`)
        g.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = g
        ctx.fillRect(0, 0, w, h)
      })

      // ── Stars ─────────────────────────────────────────────────────────
      starsRef.current.forEach(s => {
        const px = (mx - 0.5) * s.z * 32
        const py = (my - 0.5) * s.z * 32
        const tw = 0.65 + Math.sin(t * 1.8 + s.twOff) * 0.35
        const alpha = s.bright * tw * fi
        const sx = s.x + px, sy = s.y + py
        ctx.globalAlpha = alpha
        ctx.fillStyle = `rgb(${s.r},${s.g},${s.b})`
        ctx.beginPath()
        ctx.arc(sx, sy, s.size * tw, 0, Math.PI * 2)
        ctx.fill()
        // Larger stars get a soft halo
        if (s.size > 1.3) {
          const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, s.size * 4)
          halo.addColorStop(0, `rgba(${s.r},${s.g},${s.b},${alpha * 0.35})`)
          halo.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.fillStyle = halo
          ctx.beginPath()
          ctx.arc(sx, sy, s.size * 4, 0, Math.PI * 2)
          ctx.fill()
        }
      })
      ctx.globalAlpha = 1

      // ── AI Core ───────────────────────────────────────────────────────
      const pulse = 1 + Math.sin(t * 2.1) * 0.07 + Math.sin(t * 3.6) * 0.03
      const mouseAttract = 1 + (Math.abs(mx - 0.5) + Math.abs(my - 0.5)) * 0.2
      let coreScale = pulse * mouseAttract

      // Success explosion
      if (successRef.current) {
        successTickRef.current += 0.025
        coreScale *= 1 + successTickRef.current * 4
      }

      // Outer aura layers (deep glow rings)
      for (let i = 6; i >= 1; i--) {
        const r = (100 + i * 80) * coreScale
        const hue = 241 + i * 5
        const ag = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
        const aa = (0.07 / i) * fi
        ag.addColorStop(0, `hsla(${hue},80%,60%,${aa})`)
        ag.addColorStop(0.5, `hsla(${hue + 20},70%,55%,${aa * 0.4})`)
        ag.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = ag
        ctx.fillRect(0, 0, w, h)
      }

      // Neural tendrils radiating from core
      ctx.save()
      ctx.shadowBlur = 8
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * Math.PI * 2 + t * 0.18 + Math.sin(t * 0.7 + i) * 0.3
        const len = (55 + Math.sin(t * 1.5 + i * 0.9) * 22) * coreScale
        const endX = cx + Math.cos(a) * len
        const endY = cy + Math.sin(a) * len
        const cpX = cx + Math.cos(a + 0.55) * len * 0.55
        const cpY = cy + Math.sin(a + 0.55) * len * 0.55
        const hue = 241 + (i % 3) * 30
        const alpha = (0.18 + Math.sin(t * 2.2 + i) * 0.08) * fi
        ctx.strokeStyle = `hsla(${hue},80%,70%,${alpha})`
        ctx.shadowColor = `hsl(${hue},80%,70%)`
        ctx.lineWidth = 0.7
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.quadraticCurveTo(cpX, cpY, endX, endY)
        ctx.stroke()
      }
      ctx.restore()

      // Morphing core shape layers
      const coreLayers = [
        { r: 90, hue: 241, l: 65, alpha: 0.55 },
        { r: 62, hue: 265, l: 60, alpha: 0.50 },
        { r: 38, hue: 195, l: 68, alpha: 0.65 },
        { r: 18, hue: 220, l: 80, alpha: 0.80 },
      ]
      coreLayers.forEach((cl, idx) => {
        const morph = Math.sin(t * (1.2 + idx * 0.35)) * 0.28
        ctx.beginPath()
        for (let a = 0; a <= Math.PI * 2 + 0.06; a += 0.04) {
          const rr = cl.r * coreScale * (1 + morph * Math.sin(a * (3 + idx) + t * 1.8) * 0.35)
          const x = cx + Math.cos(a) * rr
          const y = cy + Math.sin(a) * rr
          if (a <= 0.04) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.closePath()
        const gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, cl.r * coreScale)
        gr.addColorStop(0, `hsla(${cl.hue},85%,${cl.l}%,${cl.alpha * fi})`)
        gr.addColorStop(0.55, `hsla(${cl.hue},75%,${cl.l - 10}%,${cl.alpha * 0.4 * fi})`)
        gr.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = gr
        ctx.shadowBlur = 20
        ctx.shadowColor = `hsl(${cl.hue},80%,65%)`
        ctx.fill()
      })
      ctx.shadowBlur = 0

      // Core center — pure white hot spot
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 22 * coreScale)
      cg.addColorStop(0, `rgba(255,255,255,${0.95 * fi})`)
      cg.addColorStop(0.4, `rgba(165,180,252,${0.75 * fi})`)
      cg.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = cg
      ctx.shadowBlur = 40
      ctx.shadowColor = '#a5b4fc'
      ctx.beginPath()
      ctx.arc(cx, cy, 22 * coreScale, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      // Orbiting energy nodes
      for (let i = 0; i < 5; i++) {
        const oa = (i / 5) * Math.PI * 2 + t * (0.4 + i * 0.08)
        const orbitR = (110 + i * 8) * coreScale
        const nx = cx + Math.cos(oa) * orbitR
        const ny = cy + Math.sin(oa) * orbitR
        const ng = ctx.createRadialGradient(nx, ny, 0, nx, ny, 5 * coreScale)
        ng.addColorStop(0, `rgba(199,210,254,${0.8 * fi})`)
        ng.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = ng
        ctx.beginPath()
        ctx.arc(nx, ny, 5 * coreScale, 0, Math.PI * 2)
        ctx.fill()
        // Trail connecting to core
        ctx.strokeStyle = `rgba(129,140,248,${0.12 * fi})`
        ctx.lineWidth = 0.5
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(nx, ny)
        ctx.stroke()
      }

      // ── Electric arcs ─────────────────────────────────────────────────
      if (Math.random() < 0.045 && arcsRef.current.length < 10) {
        arcsRef.current.push(mkArc(cx, cy))
      }
      arcsRef.current = arcsRef.current.filter(a => a.life < a.max)
      ctx.save()
      ctx.shadowBlur = 5
      ctx.shadowColor = '#c7d2fe'
      arcsRef.current.forEach(arc => {
        arc.life++
        const progress = arc.life / arc.max
        const aAlpha = Math.sin(progress * Math.PI) * 0.75 * fi
        ctx.strokeStyle = `rgba(199,210,254,${aAlpha})`
        ctx.lineWidth = 0.6
        ctx.beginPath()
        arc.pts.forEach(([x, y], i) => {
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        })
        ctx.stroke()
      })
      ctx.restore()

      // ── Ambient particles ─────────────────────────────────────────────
      particlesRef.current.forEach(p => {
        // Slight mouse gravity
        const dx = cx + (mx - 0.5) * 60 - p.x
        const dy = cy + (my - 0.5) * 60 - p.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        p.vx += dx / dist * 0.002
        p.vy += dy / dist * 0.002
        p.vx *= 0.98
        p.vy *= 0.98
        p.x += p.vx
        p.y += p.vy
        p.life++
        if (p.life >= p.max) Object.assign(p, mkParticle(cx, cy))
        const prog = p.life / p.max
        const pa = Math.sin(prog * Math.PI) * 0.55 * fi
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue},75%,70%,${pa})`
        ctx.fill()
      })

      // ── Shockwaves (click FX) ─────────────────────────────────────────
      clickFX.current = clickFX.current.filter(s => s.alpha > 0.008)
      clickFX.current.forEach(s => {
        s.r += (s.maxR - s.r) * 0.09
        s.alpha *= 0.91
        for (let ring = 0; ring < 4; ring++) {
          const rr = s.r - ring * 18
          if (rr < 0) continue
          ctx.beginPath()
          ctx.arc(s.x, s.y, rr, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(99,102,241,${s.alpha * (1 - ring * 0.22)})`
          ctx.lineWidth = 1.8 - ring * 0.4
          ctx.stroke()
        }
        // Central flash
        if (s.alpha > 0.5) {
          const fg = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 30)
          fg.addColorStop(0, `rgba(165,180,252,${(s.alpha - 0.5) * 0.5})`)
          fg.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.fillStyle = fg
          ctx.fillRect(s.x - 30, s.y - 30, 60, 60)
        }
      })

      // ── Login success — cinematic collapse ────────────────────────────
      if (successRef.current) {
        const st = successTickRef.current
        // Expanding light rings
        for (let i = 0; i < 8; i++) {
          const rr = (st * 600 + i * 120) % Math.max(w, h)
          ctx.beginPath()
          ctx.arc(cx, cy, rr, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(129,140,248,${Math.max(0, 0.5 - rr / Math.max(w, h))})`
          ctx.lineWidth = 2
          ctx.stroke()
        }
        // White-out
        const woa = Math.min(1, st * 0.6)
        const wg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h))
        wg.addColorStop(0, `rgba(180,190,255,${woa * 0.8})`)
        wg.addColorStop(0.5, `rgba(99,102,241,${woa * 0.4})`)
        wg.addColorStop(1, `rgba(1,1,12,${woa})`)
        ctx.fillStyle = wg
        ctx.fillRect(0, 0, w, h)
      }

      // ── Vignette ─────────────────────────────────────────────────────
      const vig = ctx.createRadialGradient(cx, cy, h * 0.22, cx, cy, h * 1.1)
      vig.addColorStop(0, 'rgba(0,0,0,0)')
      vig.addColorStop(1, `rgba(0,0,8,${0.72 * fi})`)
      ctx.fillStyle = vig
      ctx.fillRect(0, 0, w, h)
    }

    draw()
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, []) // empty — reads exclusively from refs

  // ── Mouse tracking ────────────────────────────────────────────────────────
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX / window.innerWidth
      mouseRef.current.y = e.clientY / window.innerHeight
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  // ── Click → shockwave ─────────────────────────────────────────────────────
  const onRootClick = useCallback((e: React.MouseEvent) => {
    clickFX.current.push({ x: e.clientX, y: e.clientY, r: 4, maxR: 220, alpha: 0.9 })
    if (clickFX.current.length > 12) clickFX.current.shift()
  }, [])

  // ── Auth handlers ─────────────────────────────────────────────────────────
  const triggerError = (msg: string) => {
    glitchRef.current = true
    setGlitch(true)
    setErrMsg(msg)
    setTimeout(() => { glitchRef.current = false; setGlitch(false) }, 750)
  }

  const triggerSuccess = () => {
    successRef.current = true
    setSuccess(true)
    setTimeout(() => navigate('/chat'), 2800)
  }

  const doLogin = async () => {
    if (!lEmail || !lPw) { triggerError('TÜM SAHƏLƏRİ DOLDURUN'); return }
    setLoading(true); setErrMsg('')
    try {
      await login(lEmail, lPw)
      triggerSuccess()
    } catch {
      triggerError('NEURAL.ID YAXUD CİPHER.KEY YANLIŞDIR')
    } finally { setLoading(false) }
  }

  const doRegister = async () => {
    if (!rName || !rEmail || !rPw) { triggerError('TÜM SAHƏLƏRİ DOLDURUN'); return }
    setLoading(true); setErrMsg('')
    try {
      await registerUser(rEmail, rPw, rName)
      triggerSuccess()
    } catch {
      triggerError('QEYDİYYAT XƏTASI — YENİDƏN CƏHD EDİN')
    } finally { setLoading(false) }
  }

  const handleKeyDown = (e: React.KeyboardEvent, fn: () => void) => {
    if (e.key === 'Enter') fn()
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const isActive = phase >= 2

  // ─────────────────────────────────────────────────────────────────────────────
  //  JSX
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: '#01010c',
        overflow: 'hidden',
        cursor: 'crosshair',
        fontFamily: "'Space Mono', monospace",
      }}
      onClick={onRootClick}
    >
      {/* ── Google Font import ──────────────────────────────────────────── */}
      <link
        rel="preconnect"
        href="https://fonts.googleapis.com"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap"
        rel="stylesheet"
      />

      {/* ── 3D Space canvas ────────────────────────────────────────────── */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, zIndex: 0 }}
        aria-hidden="true"
      />

      {/* ── Scanlines ──────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,200,180,0.007) 3px, rgba(0,200,180,0.007) 4px)',
        }}
      />

      {/* ── Chromatic aberration strips ─────────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
          backgroundImage:
            'linear-gradient(90deg, rgba(255,0,128,0.012) 0%, transparent 30%, transparent 70%, rgba(0,255,255,0.012) 100%)',
        }}
      />

      {/* ── Glitch flash ───────────────────────────────────────────────── */}
      {glitch && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0, zIndex: 99, pointerEvents: 'none',
            background: 'linear-gradient(45deg, rgba(255,0,100,0.09) 0%, rgba(0,255,255,0.09) 100%)',
            animation: 'glitchFlash 0.08s steps(3) infinite',
            transform: `translate(${(Math.random() - 0.5) * 8}px, ${(Math.random() - 0.5) * 4}px)`,
          }}
        />
      )}

      {/* ── Success overlay ─────────────────────────────────────────────── */}
      {success && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0, zIndex: 300, pointerEvents: 'none',
            background: 'radial-gradient(circle at center, rgba(99,102,241,0.25) 0%, rgba(1,1,12,0) 60%)',
            animation: 'successWhiteout 2.8s cubic-bezier(0.4,0,0.2,1) forwards',
          }}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          NAVIGATION
      ═══════════════════════════════════════════════════════════════════ */}
      <nav
        role="navigation"
        aria-label="Main navigation"
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
          padding: '20px 40px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: '1px solid rgba(99,102,241,0.07)',
          backdropFilter: isActive ? 'blur(8px)' : 'none',
          opacity: isActive ? 1 : 0,
          transform: isActive ? 'translateY(0)' : 'translateY(-24px)',
          transition: 'all 1s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: 'linear-gradient(135deg, #6366f1, #9333ea)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 24px rgba(99,102,241,0.55)',
            animation: 'logoPulse 2.5s ease-in-out infinite',
            flexShrink: 0,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <span style={{
            fontSize: 22, fontWeight: 700, letterSpacing: 3,
            background: 'linear-gradient(135deg, #818cf8, #c084fc)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            ARN AI
          </span>
        </div>

        {/* Nav buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <NavBtn
            label="GİRİŞ"
            onClick={e => { e.stopPropagation(); setPanel('login'); setErrMsg('') }}
            variant="ghost"
          />
          <NavBtn
            label="QEYDİYYAT"
            onClick={e => { e.stopPropagation(); setPanel('register'); setErrMsg('') }}
            variant="primary"
          />
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════════
          CENTER GATEWAY BUTTONS  (shown when no panel is open)
      ═══════════════════════════════════════════════════════════════════ */}
      {isActive && !panel && !success && (
        <div
          style={{
            position: 'absolute', bottom: '10%', left: 0, right: 0, zIndex: 15,
            display: 'flex', justifyContent: 'center', gap: 28, flexWrap: 'wrap',
            padding: '0 20px',
            animation: 'fadeUp 1s 0.2s cubic-bezier(0.16,1,0.3,1) both',
          }}
        >
          <GatewayBtn
            tag="// auth.node.connect"
            label="ENTER GATEWAY"
            accent="#818cf8"
            onClick={e => { e.stopPropagation(); setPanel('login') }}
          />
          <GatewayBtn
            tag="// new.entity.init"
            label="JOIN SINGULARITY"
            accent="#c084fc"
            onClick={e => { e.stopPropagation(); setPanel('register') }}
          />
        </div>
      )}

      {/* ── Center core label ──────────────────────────────────────────── */}
      {isActive && !panel && !success && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', zIndex: 10,
          transform: 'translate(-50%, 130px)',
          textAlign: 'center', pointerEvents: 'none',
          animation: 'fadeUp 1.2s 0.5s cubic-bezier(0.16,1,0.3,1) both',
        }}>
          <div style={{ fontSize: 8, letterSpacing: 4, color: 'rgba(129,140,248,0.45)', marginBottom: 6 }}>
            NEURAL CORE · ACTIVE
          </div>
          <div style={{
            fontSize: 13, fontWeight: 700, letterSpacing: 6,
            background: 'linear-gradient(135deg, rgba(129,140,248,0.7), rgba(192,132,252,0.7))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            ARN AI SINGULARITY
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          HOLOGRAPHIC PANEL BACKDROP
      ═══════════════════════════════════════════════════════════════════ */}
      {panel && !success && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={panel === 'login' ? 'Login panel' : 'Register panel'}
          style={{
            position: 'absolute', inset: 0, zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(6px)',
            background: 'rgba(1,1,12,0.35)',
          }}
          onClick={e => { if (e.target === e.currentTarget) setPanel(null) }}
        >
          {/* ── LOGIN PANEL ────────────────────────────────────────────── */}
          {panel === 'login' && (
            <div
              onClick={e => e.stopPropagation()}
              className={glitch ? 'glitch-panel' : ''}
              style={{
                width: 420, maxWidth: 'calc(100vw - 40px)',
                padding: '36px 40px', borderRadius: 18,
                background: 'rgba(4,4,22,0.92)',
                border: '1px solid rgba(99,102,241,0.42)',
                boxShadow: '0 0 60px rgba(99,102,241,0.18), 0 0 120px rgba(99,102,241,0.07), inset 0 0 60px rgba(99,102,241,0.04)',
                backdropFilter: 'blur(40px)',
                animation: 'panelReveal 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
                position: 'relative', overflow: 'hidden',
              }}
            >
              {/* Corner decorations */}
              <CornerDecor accent="#818cf8" />

              <PanelHeader
                nodeLabel="// auth.node.connect"
                title="GATEWAY ACCESS"
                accent="#818cf8"
                onClose={() => { setPanel(null); setErrMsg('') }}
              />

              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 22 }}
                onKeyDown={e => handleKeyDown(e, doLogin)}
              >
                <HoloInput
                  label="NEURAL.ID (EMAIL)"
                  value={lEmail} onChange={setLEmail}
                  type="email" glitch={glitch} accent="#818cf8"
                />
                <HoloInput
                  label="CIPHER.KEY (PASSWORD)"
                  value={lPw} onChange={setLPw}
                  type="password" glitch={glitch} accent="#818cf8"
                />

                {errMsg && <ErrorLine msg={errMsg} />}

                <SubmitBtn
                  label={loading ? 'CONNECTING...' : 'INITIATE CONNECTION'}
                  icon="⚡"
                  accent="#6366f1"
                  disabled={loading}
                  onClick={e => { e.stopPropagation(); doLogin() }}
                />

                <div style={{
                  textAlign: 'center', fontSize: 10, letterSpacing: 2,
                  color: 'rgba(148,163,184,0.45)',
                }}>
                  NEW ENTITY?{' '}
                  <span
                    role="button"
                    tabIndex={0}
                    style={{ color: '#818cf8', cursor: 'pointer', outline: 'none' }}
                    onClick={() => { setPanel('register'); setErrMsg('') }}
                    onKeyDown={e => { if (e.key === 'Enter') { setPanel('register'); setErrMsg('') } }}
                  >
                    JOIN SINGULARITY →
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── REGISTER PANEL ─────────────────────────────────────────── */}
          {panel === 'register' && (
            <div
              onClick={e => e.stopPropagation()}
              className={glitch ? 'glitch-panel' : ''}
              style={{
                width: 420, maxWidth: 'calc(100vw - 40px)',
                padding: '36px 40px', borderRadius: 18,
                background: 'rgba(4,4,22,0.92)',
                border: '1px solid rgba(168,85,247,0.42)',
                boxShadow: '0 0 60px rgba(168,85,247,0.18), 0 0 120px rgba(168,85,247,0.07), inset 0 0 60px rgba(168,85,247,0.04)',
                backdropFilter: 'blur(40px)',
                animation: 'panelReveal 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
                position: 'relative', overflow: 'hidden',
              }}
            >
              <CornerDecor accent="#c084fc" />

              <PanelHeader
                nodeLabel="// entity.register.init"
                title="JOIN SINGULARITY"
                accent="#c084fc"
                onClose={() => { setPanel(null); setErrMsg('') }}
              />

              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
                onKeyDown={e => handleKeyDown(e, doRegister)}
              >
                <HoloInput
                  label="ENTITY.NAME (USERNAME)"
                  value={rName} onChange={setRName}
                  type="text" glitch={glitch} accent="#c084fc"
                />
                <HoloInput
                  label="NEURAL.ID (EMAIL)"
                  value={rEmail} onChange={setREmail}
                  type="email" glitch={glitch} accent="#c084fc"
                />
                <HoloInput
                  label="CIPHER.KEY (PASSWORD)"
                  value={rPw} onChange={setRPw}
                  type="password" glitch={glitch} accent="#c084fc"
                />

                {errMsg && <ErrorLine msg={errMsg} />}

                <SubmitBtn
                  label={loading ? 'INITIALIZING...' : 'ENTER SINGULARITY'}
                  icon="◈"
                  accent="#a855f7"
                  disabled={loading}
                  onClick={e => { e.stopPropagation(); doRegister() }}
                />

                <div style={{
                  textAlign: 'center', fontSize: 10, letterSpacing: 2,
                  color: 'rgba(148,163,184,0.45)',
                }}>
                  EXISTING ENTITY?{' '}
                  <span
                    role="button"
                    tabIndex={0}
                    style={{ color: '#c084fc', cursor: 'pointer', outline: 'none' }}
                    onClick={() => { setPanel('login'); setErrMsg('') }}
                    onKeyDown={e => { if (e.key === 'Enter') { setPanel('login'); setErrMsg('') } }}
                  >
                    ACCESS GATEWAY →
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          HUD OVERLAYS
      ═══════════════════════════════════════════════════════════════════ */}
      {isActive && (
        <>
          {/* Bottom-left status */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute', bottom: 22, left: 28, zIndex: 10,
              fontSize: 8, letterSpacing: 2, color: 'rgba(99,102,241,0.38)',
              lineHeight: 2, pointerEvents: 'none',
              opacity: isActive ? 1 : 0,
              transition: 'opacity 1.5s',
            }}
          >
            <div>ARN.AI SINGULARITY GATEWAY v6.0</div>
            <div>NEURAL.CORE ▸ ONLINE</div>
            <div>LATENCY ▸ &lt;12ms</div>
          </div>

          {/* Bottom-right status */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute', bottom: 22, right: 28, zIndex: 10,
              fontSize: 8, letterSpacing: 2, color: 'rgba(99,102,241,0.38)',
              lineHeight: 2, textAlign: 'right', pointerEvents: 'none',
              opacity: isActive ? 1 : 0, transition: 'opacity 1.5s',
            }}
          >
            <div>UPTIME ▸ 99.97%</div>
            <div>ENTITIES ▸ ████████ ∞</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
              <span style={{
                width: 5, height: 5, borderRadius: '50%',
                background: '#4ade80', boxShadow: '0 0 6px #4ade80', display: 'inline-block',
                animation: 'statusBlink 2s ease-in-out infinite',
              }} />
              CORE ACTIVE
            </div>
          </div>

          {/* Top-center gate status */}
          {!panel && (
            <div style={{
              position: 'absolute', top: 78, left: 0, right: 0, zIndex: 10,
              textAlign: 'center', pointerEvents: 'none',
              animation: 'fadeUp 1s 0.8s cubic-bezier(0.16,1,0.3,1) both',
            }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '6px 18px', borderRadius: 30,
                background: 'rgba(99,102,241,0.08)',
                border: '1px solid rgba(99,102,241,0.2)',
                fontSize: 8, letterSpacing: 3, color: 'rgba(129,140,248,0.7)',
              }}>
                <span style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: '#4ade80', boxShadow: '0 0 8px #4ade80',
                  display: 'inline-block', animation: 'statusBlink 1.8s ease-in-out infinite',
                }} />
                GROQ API · NEURAL ENGINE · ONLINE
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Success message ─────────────────────────────────────────────── */}
      {success && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 400,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
          animation: 'successReveal 0.8s 0.3s cubic-bezier(0.16,1,0.3,1) both',
        }}>
          <div style={{
            fontSize: 8, letterSpacing: 5, color: 'rgba(129,140,248,0.6)', marginBottom: 12,
          }}>
            // connection.established
          </div>
          <div style={{
            fontSize: 28, fontWeight: 700, letterSpacing: 6,
            background: 'linear-gradient(135deg, #818cf8, #c084fc, #818cf8)',
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            animation: 'shimmer 1.5s linear infinite',
          }}>
            ACCESS GRANTED
          </div>
          <div style={{ fontSize: 9, letterSpacing: 3, color: 'rgba(148,163,184,0.5)', marginTop: 10 }}>
            ENTERING NEURAL DASHBOARD...
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────
          KEYFRAMES
      ───────────────────────────────────────────────────────────────── */}
      <style>{`
        @keyframes logoPulse {
          0%,100% { box-shadow: 0 0 24px rgba(99,102,241,0.55); }
          50%      { box-shadow: 0 0 40px rgba(99,102,241,0.85), 0 0 70px rgba(99,102,241,0.3); }
        }
        @keyframes panelReveal {
          from { opacity:0; transform: scale(0.88) translateY(24px) rotateX(8deg); }
          to   { opacity:1; transform: scale(1)    translateY(0)     rotateX(0deg); }
        }
        @keyframes fadeUp {
          from { opacity:0; transform: translateY(32px); }
          to   { opacity:1; transform: translateY(0); }
        }
        @keyframes borderPulse {
          0%,100% { opacity:0.35; }
          50%      { opacity:0.9;  }
        }
        @keyframes scanH {
          from { transform: translateX(-150%); }
          to   { transform: translateX(500%); }
        }
        @keyframes glitchFlash {
          0%   { transform: translateX(-3px) skewX(-1deg); filter: hue-rotate(15deg)  saturate(1.4); }
          33%  { transform: translateX( 3px) skewX( 1deg); filter: hue-rotate(-15deg) saturate(1.6); }
          66%  { transform: translateX(-1px) skewX( 0.5deg); filter: hue-rotate(5deg); }
          100% { transform: translateX(0); filter: none; }
        }
        @keyframes successWhiteout {
          0%   { opacity:0; }
          15%  { opacity:1; }
          70%  { opacity:1; background: radial-gradient(circle at center, rgba(180,190,255,0.4) 0%, rgba(1,1,12,0.6) 100%); }
          100% { opacity:1; background: #01010c; }
        }
        @keyframes successReveal {
          from { opacity:0; transform: scale(0.9); }
          to   { opacity:1; transform: scale(1); }
        }
        @keyframes shimmer {
          from { background-position: 200% 0; }
          to   { background-position: -200% 0; }
        }
        @keyframes statusBlink {
          0%,100% { opacity:1; }
          50%      { opacity:0.35; }
        }
        @keyframes cornerSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .glitch-panel {
          animation: glitchPanel 0.12s steps(4) infinite !important;
        }
        @keyframes glitchPanel {
          0%   { transform: translateX(-4px) skewX(-1.5deg); filter: hue-rotate(20deg)  saturate(1.5); }
          25%  { transform: translateX( 4px) skewX( 1.5deg); filter: hue-rotate(-20deg) saturate(1.8); }
          50%  { transform: translateX(-2px);                filter: hue-rotate(8deg); }
          75%  { transform: translateX( 2px) skewX(-0.5deg); filter: hue-rotate(-5deg); }
          100% { transform: translateX(0);                   filter: none; }
        }

        /* Remove ugly autofill background in Chrome */
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px rgba(4,4,22,0.95) inset !important;
          -webkit-text-fill-color: white !important;
          caret-color: white;
          transition: background-color 99999s;
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
          }
        }
      `}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  Tiny reusable UI atoms
// ─────────────────────────────────────────────────────────────────────────────

function NavBtn({
  label, onClick, variant,
}: {
  label: string
  onClick: (e: React.MouseEvent) => void
  variant: 'ghost' | 'primary'
}) {
  const base: React.CSSProperties = {
    fontFamily: "'Space Mono', monospace", fontSize: 10,
    letterSpacing: 3, fontWeight: 700, cursor: 'pointer',
    padding: '10px 20px', borderRadius: 7,
    transition: 'all 0.25s',
  }
  const styles: Record<string, React.CSSProperties> = {
    ghost: {
      ...base,
      background: 'rgba(10,10,30,0.7)', border: '1px solid rgba(99,102,241,0.35)',
      color: 'rgba(129,140,248,0.9)', boxShadow: 'none',
    },
    primary: {
      ...base,
      background: 'linear-gradient(135deg, rgba(99,102,241,0.28), rgba(139,92,246,0.22))',
      border: '1px solid rgba(99,102,241,0.6)', color: 'white',
      boxShadow: '0 0 18px rgba(99,102,241,0.22)',
    },
  }
  return (
    <button
      style={styles[variant]}
      onClick={onClick}
      onMouseEnter={e => { (e.currentTarget).style.boxShadow = '0 0 28px rgba(99,102,241,0.55)' }}
      onMouseLeave={e => { (e.currentTarget).style.boxShadow = variant === 'primary' ? '0 0 18px rgba(99,102,241,0.22)' : 'none' }}
    >
      {label}
    </button>
  )
}

function GatewayBtn({
  tag, label, accent, onClick,
}: {
  tag: string; label: string; accent: string; onClick: (e: React.MouseEvent) => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: "'Space Mono', monospace",
        background: 'rgba(4,4,20,0.85)',
        border: `1px solid ${accent}55`,
        color: 'rgba(255,255,255,0.88)',
        padding: '18px 36px', borderRadius: 10, cursor: 'pointer',
        boxShadow: `0 0 24px ${accent}22`,
        transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
        backdropFilter: 'blur(20px)',
        textAlign: 'center',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = `0 0 40px ${accent}55, 0 0 80px ${accent}22`
        e.currentTarget.style.borderColor = `${accent}88`
        e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = `0 0 24px ${accent}22`
        e.currentTarget.style.borderColor = `${accent}55`
        e.currentTarget.style.transform = 'translateY(0) scale(1)'
      }}
    >
      <div style={{ fontSize: 8, letterSpacing: 3, color: accent, opacity: 0.6, marginBottom: 6 }}>
        {tag}
      </div>
      <div style={{ fontSize: 13, letterSpacing: 3, fontWeight: 700 }}>
        {label}
      </div>
    </button>
  )
}

function SubmitBtn({
  label, icon, accent, disabled, onClick,
}: {
  label: string; icon: string; accent: string; disabled: boolean
  onClick: (e: React.MouseEvent) => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-busy={disabled}
      style={{
        width: '100%', padding: '15px', borderRadius: 9,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: "'Space Mono', monospace", fontSize: 10,
        letterSpacing: 3, fontWeight: 700, color: 'white',
        background: `linear-gradient(135deg, ${accent}33, ${accent}22)`,
        border: `1px solid ${accent}80`,
        boxShadow: `0 0 24px ${accent}30`,
        transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
        opacity: disabled ? 0.5 : 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}
      onMouseEnter={e => {
        if (!disabled) {
          e.currentTarget.style.boxShadow = `0 0 40px ${accent}70, inset 0 0 30px ${accent}15`
          e.currentTarget.style.transform = 'translateY(-2px)'
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = `0 0 24px ${accent}30`
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  )
}

function ErrorLine({ msg }: { msg: string }) {
  return (
    <div
      role="alert"
      style={{
        color: '#f87171', fontFamily: "'Space Mono', monospace",
        fontSize: 9, letterSpacing: 2, textAlign: 'center',
        textShadow: '0 0 12px rgba(248,113,113,0.6)',
        padding: '8px 12px', borderRadius: 6,
        background: 'rgba(248,113,113,0.06)',
        border: '1px solid rgba(248,113,113,0.2)',
        animation: 'fadeUp 0.3s ease-out',
      }}
    >
      ⚠ {msg}
    </div>
  )
}

function CornerDecor({ accent }: { accent: string }) {
  const corner: React.CSSProperties = {
    position: 'absolute', width: 12, height: 12,
    borderColor: accent, borderStyle: 'solid', opacity: 0.6,
  }
  return (
    <>
      <div aria-hidden="true" style={{ ...corner, top: 12, left: 12, borderWidth: '1px 0 0 1px' }} />
      <div aria-hidden="true" style={{ ...corner, top: 12, right: 12, borderWidth: '1px 1px 0 0' }} />
      <div aria-hidden="true" style={{ ...corner, bottom: 12, left: 12, borderWidth: '0 0 1px 1px' }} />
      <div aria-hidden="true" style={{ ...corner, bottom: 12, right: 12, borderWidth: '0 1px 1px 0' }} />
    </>
  )
}
