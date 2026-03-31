import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Splash screen
const splash = document.createElement('div')
splash.id = 'splash'
splash.innerHTML = `
  <video autoplay muted playsinline id="splash-video">
    <source src="/splash.mp4" type="video/mp4">
  </video>
`
splash.style.cssText = `
  position:fixed;top:0;left:0;width:100%;height:100%;
  background:#000;z-index:9999;display:flex;
  align-items:center;justify-content:center;
`
document.body.appendChild(splash)

const video = splash.querySelector('video') as HTMLVideoElement
video.onended = () => {
  splash.style.opacity = '0'
  splash.style.transition = 'opacity 0.5s'
  setTimeout(() => splash.remove(), 500)
}
setTimeout(() => {
  splash.style.opacity = '0'
  splash.style.transition = 'opacity 0.5s'
  setTimeout(() => splash.remove(), 500)
}, 4000)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
