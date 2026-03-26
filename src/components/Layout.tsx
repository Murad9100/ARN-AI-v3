import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useChatStore } from '../store/chatStore'

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { user, signOut } = useAuthStore()
  const { chats, currentChatId, addChat, setCurrentChat, deleteChat } = useChatStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleNewChat = () => {
    const id = addChat()
    navigate('/chat')
    setCurrentChat(id)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="flex h-screen bg-[#0a0a0f] overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-[#0d1117] border-r border-[#00ff88]/20 flex flex-col overflow-hidden`}>
        {/* Logo */}
        <div className="p-4 border-b border-[#00ff88]/20">
          <h1 className="text-xl font-bold text-[#00ff88]">⚡ ARN AI</h1>
          <p className="text-xs text-gray-500 mt-1">Cybersecurity Assistant</p>
        </div>

        {/* New Chat */}
        <div className="p-3">
          <button
            onClick={handleNewChat}
            className="w-full py-2 px-4 bg-[#00ff88]/10 hover:bg-[#00ff88]/20 border border-[#00ff88]/30 rounded-lg text-[#00ff88] text-sm font-medium transition-all"
          >
            + Yeni Söhbət
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => { setCurrentChat(chat.id); navigate('/chat') }}
              className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer text-sm transition-all ${
                currentChatId === chat.id
                  ? 'bg-[#00ff88]/20 text-[#00ff88]'
                  : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              <span className="truncate flex-1">💬 {chat.title}</span>
              <button
                onClick={(e) => { e.stopPropagation(); deleteChat(chat.id) }}
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 ml-2 text-xs"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* User Info */}
        <div className="p-3 border-t border-[#00ff88]/20">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#00ff88]/20 flex items-center justify-center text-[#00ff88] text-sm font-bold">
              {user?.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{user?.full_name}</p>
              <p className="text-xs text-[#00ff88] capitalize">{user?.plan} Plan</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/settings')}
              className="flex-1 py-1.5 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"
            >
              ⚙️ Parametrlər
            </button>
            <button
              onClick={handleSignOut}
              className="flex-1 py-1.5 text-xs text-red-400 hover:text-red-300 bg-white/5 hover:bg-red-500/10 rounded-lg transition-all"
            >
              🚪 Çıxış
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-14 border-b border-[#00ff88]/20 flex items-center px-4 gap-4 bg-[#0d1117]">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-[#00ff88] transition-colors"
          >
            ☰
          </button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00ff88] pulse-green"></div>
            <span className="text-sm text-gray-400">
              {location.pathname === '/chat' ? 'Chat' : 
               location.pathname === '/settings' ? 'Parametrlər' : 'ARN AI'}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => navigate('/pricing')}
              className="text-xs px-3 py-1 border border-[#00ff88]/30 text-[#00ff88] rounded-full hover:bg-[#00ff88]/10 transition-all"
            >
              {user?.plan === 'free' ? '⚡ Upgrade' : `✅ ${user?.plan?.toUpperCase()}`}
            </button>
            <span className="text-xs text-gray-500">
              {user?.plan === 'max' ? '∞' : `${user?.tokens_used}/${user?.tokens_limit}`} token
            </span>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}