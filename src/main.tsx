import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const splash = document.createElement('div')
splash.id = 'splash'
splash.style.cssText = `
  position:fixed;top:0;left:0;width:100%;height:100%;
  background:#000;z-index:9999;display:flex;
  align-items:center;justify-content:center;
`

const video = document.createElement('video')
video.src = '/splash.mp4'
video.muted = true
video.playsInline = true
video.autoplay = true
video.style.cssText = 'width:100%;height:100%;object-fit:cover;'

video.onended = () => {
  splash.style.opacity = '0'
  splash.style.transition = 'opacity 0.5s'
  setTimeout(() => splash.remove(), 500)
}

video.play().catch(() => splash.remove())

setTimeout(() => {
  splash.style.opacity = '0'
  splash.style.transition = 'opacity 0.5s'
  setTimeout(() => splash.remove(), 500)
}, 4000)

splash.appendChild(video)
document.body.appendChild(splash)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
