const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

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
NOT: Sən Free planda işləyirsən. Ətraflı pentest təlimatları, exploit kodları və advanced mövzular üçün Pro plana keçməyi tövsiyə et.\`,

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
VACIB: Sualı HƏMİŞƏ birbaşa cavabla. Özünü hər dəfə təqdim etmə.\`,
}

// Free: sürətli + yüksək rate limit | Pro/Max: güclü model
const MODELS = {
  free: 'llama-3.1-8b-instant',
  pro: 'llama-3.3-70b-versatile',
  max: 'llama-3.3-70b-versatile',
}

const MAX_TOKENS = {
  free: 512,
  pro: 2048,
  max: 4096,
}

// Rate limit gəldikdə Groq neçə saniyə gözləmək lazım olduğunu bildirir
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
  if (!GROQ_API_KEY) {
    throw new Error('VITE_GROQ_API_KEY tapılmadı. .env faylını yoxlayın.')
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
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
    const err = await response.json().catch(() => ({}))
    const msg = (err as any)?.error?.message || `Groq API xətası: HTTP ${response.status}`

    // Rate limit — avtomatik gözlə və yenidən cəhd et (max 3 dəfə)
    if (response.status === 429 && _retryCount < 3) {
      const waitMs = parseRetryAfter(msg)
      onChunk(`

⏳ Rate limit... ${Math.ceil(waitMs / 1000)}s gözlənilir...

`)
      await new Promise(r => setTimeout(r, waitMs))
      // Gözlənmə mesajını sil, yenidən başla
      return sendMessage(messages, onChunk, plan, _retryCount + 1)
    }

    throw new Error(msg)
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value)
    const lines = chunk.split('\n').filter((l) => l.startsWith('data: '))

    for (const line of lines) {
      const data = line.slice(6)
      if (data === '[DONE]') return
      try {
        const json = JSON.parse(data)
        const text = json.choices?.[0]?.delta?.content || ''
        if (text) onChunk(text)
      } catch {
        // malformed chunk — skip
      }
    }
  }
}
