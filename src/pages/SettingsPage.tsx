import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'

export default function SettingsPage() {
  const { user, fetchProfile } = useAuthStore()
  const [fullName, setFullName] = useState(user?.full_name || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    setMessage('')
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id)
      if (error) throw error
      await fetchProfile()
      setMessage('Dəyişikliklər saxlanıldı!')
    } catch {
      setMessage('Xəta baş verdi')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">⚙️ Parametrlər</h1>

      <div className="glass rounded-2xl p-6 space-y-6">
        {/* Profile */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Profil</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Ad Soyad</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00ff88] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Plan */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Plan</h3>
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <div>
              <p className="text-white font-medium capitalize">{user?.plan} Plan</p>
              <p className="text-sm text-gray-400">
                {user?.plan === 'max' ? 'Limitsiz' : `${user?.tokens_used}/${user?.tokens_limit} token istifadə edilib`}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              user?.plan === 'max' ? 'bg-purple-600 text-white' :
              user?.plan === 'pro' ? 'bg-[#00ff88] text-black' :
              'bg-white/10 text-white'
            }`}>
              {user?.plan?.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Token Usage */}
        {user?.plan !== 'max' && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Token İstifadəsi</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">İstifadə</span>
                <span className="text-[#00ff88]">{user?.tokens_used}/{user?.tokens_limit}</span>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#00ff88] to-[#00cc6a] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(((user?.tokens_used || 0) / (user?.tokens_limit || 1)) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-[#00ff88] text-black font-bold rounded-lg hover:bg-[#00ff88]/90 transition-all disabled:opacity-50"
          >
            {saving ? 'Saxlanılır...' : 'Saxla'}
          </button>
          {message && (
            <span className={`text-sm ${message.includes('Xəta') ? 'text-red-400' : 'text-[#00ff88]'}`}>
              {message}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}