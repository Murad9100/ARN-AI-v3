import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function LandingPage() {
  const { user } = useAuthStore()

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Cyber Grid Background */}
      <div className="fixed inset-0 cyber-grid opacity-30 pointer-events-none"></div>
      
      {/* Hero Section */}
      <div className="relative">
        {/* Navbar */}
        <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center animate-glow">
              <span className="text-2xl">⚡</span>
            </div>
            <span className="text-2xl font-bold gradient-text">ARN AI</span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Link to="/chat" className="btn-primary">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-secondary">
                  Giriş
                </Link>
                <Link to="/register" className="btn-primary">
                  Qeydiyyat
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Hero Content */}
        <div className="container mx-auto px-6 py-20 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6 animate-float">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-300">Powered by Advanced AI</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Kibertəhlükəsizlik üçün<br />
            <span className="gradient-text animate-gradient">AI Köməkçiniz</span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Penetration testing, etik hacking və network security sahəsində peşəkar AI assistenti. 
            Groq API ilə gücləndirilmiş, sürətli və dəqiq cavablar.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/register" className="btn-primary text-lg px-8 py-4">
              ⚡ Pulsuz Başla
            </Link>
            <Link to="/pricing" className="btn-secondary text-lg px-8 py-4">
              💎 Planlar
            </Link>
          </div>

          <div className="mt-12 flex justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span> Pulsuz plan
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span> Real-time AI
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span> Pentest bilgiləri
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Niyə <span className="gradient-text">ARN AI</span>?
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card hover:scale-105">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-bold mb-2">Sürətli Cavablar</h3>
            <p className="text-gray-400">Groq API ilə milisaniyələr içində real-time AI cavabları alın</p>
          </div>
          
          <div className="card hover:scale-105">
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="text-xl font-bold mb-2">Pentest Eksperti</h3>
            <p className="text-gray-400">Nmap, Burp Suite, Metasploit kimi alətlər haqqında dərin bilgi</p>
          </div>
          
          <div className="card hover:scale-105">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold mb-2">Əlverişli Qiymət</h3>
            <p className="text-gray-400">Pulsuz plandan limitsiz plana qədər sizə uyğun variant</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="container mx-auto px-6 py-20">
        <div className="glass-dark rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-4">Hazırsınız?</h2>
            <p className="text-gray-400 mb-8 text-lg">Kibertəhlükəsizlik biliklərini AI ilə əldə edin</p>
            <Link to="/register" className="btn-primary text-lg px-10 py-4 inline-block">
              İndi Başla →
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 border-t border-white/10">
        <div className="text-center text-gray-500 text-sm">
          <p>© 2024 ARN AI. Bütün hüquqlar qorunur.</p>
        </div>
      </footer>
    </div>
  )
}
