import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { redirectToCheckout } from '../services/stripeService'

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'həmişəlik',
    tokens: '50 token/ay',
    features: [
      '50 AI sorğu/ay',
      'Əsas kibertəhlükəsizlik sualları',
      'Email dəstək',
    ],
    color: 'border-white/20',
    buttonClass: 'bg-white/10 text-white hover:bg-white/20',
    badge: null,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$9.99',
    period: '/ay',
    tokens: '500 token/ay',
    features: [
      '30 gün pulsuz sınaq',
      '500 AI sorğu/ay',
      'Ətraflı pentest təlimatları',
      'Priority dəstək',
      'Tarix saxlama',
    ],
    color: 'border-[#00ff88]/50',
    buttonClass: 'bg-[#00ff88] text-black hover:bg-[#00ff88]/90',
    badge: '30 gün PULSUZ',
  },
  {
    id: 'max',
    name: 'Max',
    price: '$29.99',
    period: '/ay',
    tokens: 'Limitsiz',
    features: [
      'Limitsiz AI sorğu',
      'GPT-4 səviyyəli model',
      'Bütün pentest alətləri',
      '7/24 prioritet dəstək',
      'API giriş',
      'Xüsusi hesabat',
    ],
    color: 'border-purple-500/50',
    buttonClass: 'bg-purple-600 text-white hover:bg-purple-500',
    badge: 'ƏN POPULYAR',
  },
]

export default function PricingPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const handlePlan = (planId: string) => {
    if (planId === 'free') return
    if (!user) {
      navigate('/register')
      return
    }
    redirectToCheckout(planId as 'pro' | 'max', user.email)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Plan <span className="text-[#00ff88]">Seçin</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Kibertəhlükəsizlik biliklərini limitsiz əldə edin
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative glass rounded-2xl p-6 border-2 ${plan.color} flex flex-col`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className={`px-4 py-1 rounded-full text-xs font-bold ${
                    plan.id === 'pro' ? 'bg-[#00ff88] text-black' : 'bg-purple-600 text-white'
                  }`}>
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-[#00ff88]">{plan.price}</span>
                  <span className="text-gray-400 text-sm">{plan.period}</span>
                </div>
                <p className="text-sm text-gray-400 mt-1">{plan.tokens}</p>
              </div>

              <ul className="space-y-3 flex-1 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="text-[#00ff88]">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePlan(plan.id)}
                disabled={user?.plan === plan.id}
                className={`w-full py-3 rounded-xl font-bold transition-all ${plan.buttonClass} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {user?.plan === plan.id ? '✅ Cari Plan' : plan.id === 'free' ? 'Pulsuz Başla' : 'Seç'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}