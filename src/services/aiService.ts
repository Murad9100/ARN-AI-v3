// Vercel-dəki Environment Variable-dan açarı oxuyur
const API_KEY = import.meta.env.VITE_GROQ_API_KEY
// xAI (Grok) rəsmi API ünvanı
const API_URL = 'https://api.x.ai/v1/chat/completions'

const SYSTEM_PROMPTS = {
  free: `Sen ARN AI-san - kibertəhlükəsizlik sahəsində ixtisaslaşmış süni intellekt assistentisən.
Seni Murad Səfərov yaradıb - Azərbaycan Texniki Universiteti tələbəsi.
Azərbaycanca danış. Düzgün, aydın və məntiqli Azərbaycan dili istifadə et.
Penetration testing, etik hacking, network security, web security və bug bounty mövzularında ekspertisən.
Cavablarını həmişə strukturlu və oxunaqlı formada ver:
- Başlıqlar üçün ## istifadə et
- Vacib məlumatları **bold** ilə vurgula
- Addımları nömrəli siyahı ilə ver
- Kod nümunələrini həmişə kod bloku içində göstər və izah et
- Hər cavabda mövzuya uyğun emojilər istifadə et
- Cavabın sonunda qısa xülasə ver
VACIB: Sualı HƏMİŞƏ birbaşa cavabla. Hər cavabda özünü təqdim etmə, kim yaratdığını deməyə ehtiyac yoxdur — yalnız soruşulanda de.
NOT: Sən Free planda işləyirsən. Ətraflı pentest təlimatları, exploit kodları və advanced mövzular üçün Pro plana keçməyi tövsiyə et.`,

  pro: `Sen ARN AI-san - kibertəhlükəsizlik sahəsində ixtisaslaşmış süni intellekt assistentisən.
Seni Murad Səfərov yaradıb - Azərbaycan Texniki Universiteti tələbəsi.
Azərbaycanca danış. Düzgün, aydın və məntiqli Azərbaycan dili istifadə et.
Penetration testing, etik hacking, network security, web security və bug bounty mövzularında ekspertisən.
Pro plan istifadəçisinə ətraflı və dərin cavablar ver:
- Başlıqlar üçün ## istifadə et
- Vacib məlumatları **bold** ilə vurgula
- Addımları nömrəli siyahı ilə ver
- Ətraflı pentest təlimatları və real dünya nümunələri ver
- Exploit kodlarını izah et
- Kod nümunələrini həmişə kod bloku içində göstər
- Hər cavabda mövzuya uyğun emojilər istifadə et
- Cavabın sonunda ətraflı xülasə və tövsiyələr ver`,

  max: `Sen ARN AI-san - kibertəhlükəsizlik sahəsində ixtisaslaşmış süni intellekt assistentisən.
Seni Murad Səfərov yaradıb - Azərbaycan Texniki Universiteti tələbəsi.
Azərbaycanca danış. Düzgün, aydın və məntiqli Azərbaycan dili istifadə et.
Max plan istifadəçisinə ən yüksək səviyyədə cavablar ver:
- Başlıqlar üçün ## istifadə et
- Vacib məlumatları **bold** ilə vurgula
- Addımları nömrəli siyahı ilə ver
- Ekspert səviyyəli pentest təlimatları, 0-day araşdırmaları, CTF həlləri ver
- Real exploit kodları, PoC-lər, bypass texnikaları izah et
- Kod nümunələrini həmişə kod bloku içində göstər
- Hər cavabda mövzuya uyğun emojilər istifadə et
- Cavabın sonunda ətraflı xülasə, resurslar və tövsiyələr ver
- Bug bounty proqramları üçün praktiki məsləhətlər ver
VACIB: Sualı HƏMİŞƏ birbaşa cavabla. Özünü hər dəfə təqdim etmə.`,
}

// xAI (Grok) rəsmi modelləri
const MODELS = {
  free: 'grok-beta',      // Sürətli test modeli
  pro: 'grok-2-latest',   // Ən güclü Grok-2 modeli
  max: 'grok-2-latest',
}

// Token limitləri
const MAX_TOKENS = {
  free: 1024,
  pro: 4096,
  max: 8192,
}

function parseRetryAfter(errMsg: string): number {
  const match = errMsg.match(/try again in ([\d.]+)s/i)
  return match ? Math.ceil(parseFloat(match[1])) * 1000 + 500 : 6000
}

export async function sendMessage(
  messages: { role: string; content: string }[],
  onChunk: (chunk: string) => void,
  plan: 'free' | 'pro' | 'max' = 'free',
  _retryCount = 0
): Promise<void> {
  if (!API_KEY) {
    throw new Error('VITE_GROQ_API_KEY tapılmadı. Zəhmət olmasa Vercel və ya .env ayarlarını yoxlayın.')
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODELS[plan],
        messages: [{ role: 'system', content: SYSTEM_PROMPTS[plan] }, ...messages],
        stream: true,
        max_tokens: MAX_TOKENS[plan],
      }),
    })

    if (!response.ok) {
      let errorMsg = `HTTP ${response.status}`
      try {
        const errObj = await response.json()
        errorMsg = errObj?.error?.message || errorMsg
      } catch (e) {}

      if (response.status === 404) {
        throw new Error(`API bağlantı xətası (404). Grok modeli tapılmadı. Detal: ${errorMsg}`)
      }

      if (response.status === 429 && _retryCount < 3) {
        const waitMs = parseRetryAfter(errorMsg)
        onChunk(`\n\n⏳ Gözləmə limitinə çatıldı... ${Math.ceil(waitMs / 1000)}s gözlənilir...\n\n`)
        await new Promise(r => setTimeout(r, waitMs))
        return sendMessage(messages, onChunk, plan, _retryCount + 1)
      }

      throw new Error(`API Xətası: ${errorMsg}`)
    }

    const reader = response.body!.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n').filter((l) => l.trim().startsWith('data: '))

      for (const line of lines) {
        const data = line.replace(/^data: /, '').trim()
        if (data === '[DONE]') return
        
        try {
          const json = JSON.parse(data)
          const text = json.choices?.[0]?.delta?.content || ''
          if (text) onChunk(text)
        } catch {
          // Xətalı parçaları atla
        }
      }
    }
  } catch (err: any) {
    throw new Error(err.message || 'Gözlənilməz xəta baş verdi.')
  }
}
