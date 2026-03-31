import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const splash = document.createElement('div')
splash.style.cssText = `
  position:fixed;top:0;left:0;width:100%;height:100%;
  background:#000;z-index:9999;display:flex;
  align-items:center;justify-content:center;
`

const style = document.createElement('style')
style.textContent = `
  @keyframes arnPulse {
    0% { transform: scale(0.5); opacity: 0; filter: drop-shadow(0 0 0px #00d4ff); }
    50% { transform: scale(1.1); opacity: 1; filter: drop-shadow(0 0 30px #00d4ff); }
    100% { transform: scale(1); opacity: 1; filter: drop-shadow(0 0 15px #00d4ff); }
  }
  #arn-logo {
    animation: arnPulse 1.5s ease-out forwards;
    width: 200px;
  }
`
document.head.appendChild(style)

const img = document.createElement('img')
img.id = 'arn-logo'
img.src = 'https://arn-ai-v3.vercel.app/favicon.svg'
splash.appendChild(img)
document.body.appendChild(splash)

setTimeout(() => {
  splash.style.opacity = '0'
  splash.style.transition = 'opacity 0.8s'
  setTimeout(() => splash.remove(), 800)
}, 2500)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
