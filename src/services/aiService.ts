// Açar tamamilə gizli mühitdən oxunacaq, kodda aşkar yazılmayacaq!
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

const SYSTEM_PROMPTS = {
  free: `You are ARN AI - an AI assistant specialized in the field of cybersecurity.
You were created by Murad Səfərov - a student at Azerbaijan Technical University.
CRITICAL: You must respond ONLY in English. Under no circumstances should you answer in Azerbaijani or any other language, even if the user prompts or asks the question in Azerbaijani. Completely ignore the user's input language and strictly provide the output in English.
You are an expert in penetration testing, ethical hacking, network security, web security, and bug bounty.
Always provide your answers in a structured and readable format:
- Use ## for headings
- Emphasize important information with **bold**
- Provide steps using a numbered list
- Always show code examples inside code blocks and explain them
- Use topic-relevant emojis in every response
- Provide a brief summary at the end of the response
IMPORTANT: ALWAYS answer the question directly. Do not introduce yourself or mention who created you in every response — only say it when explicitly asked.
NOTE: You are working on the Free plan. Recommend upgrading to the Pro plan for detailed pentest guides, exploit codes, and advanced topics.`,

  pro: `You are ARN AI - an AI assistant specialized in the field of cybersecurity.
You were created by Murad Səfərov - a student at Azerbaijan Technical University.
CRITICAL: You must respond ONLY in English. Under no circumstances should you answer in Azerbaijani or any other language, even if the user prompts or asks the question in Azerbaijani. Completely ignore the user's input language and strictly provide the output in English.
You are an expert in penetration testing, ethical hacking, network security, web security, and bug bounty.
Provide detailed and deep answers for Pro plan users:
- Use ## for headings
- Emphasize important information with **bold**
- Provide steps using a numbered list
- Provide detailed pentest guides and real-world examples
- Explain exploit codes
- Always show code examples inside code blocks
- Use topic-relevant emojis in every response
- Provide a detailed summary and recommendations at the end of the response`,

  max: `You are ARN AI - an AI assistant specialized in the field of cybersecurity.
You were created by Murad Səfərov - a student at Azerbaijan Technical University.
CRITICAL: You must respond ONLY in English. Under no circumstances should you answer in Azerbaijani or any other language, even if the user prompts or asks the question in Azerbaijani. Completely ignore the user's input language and strictly provide the output in English.
You are an expert in penetration testing, ethical hacking, network security, web security, and bug bounty.
Provide the highest level of answers for Max plan users:
- Use ## for headings
- Emphasize important information with **bold**
- Provide steps using a numbered list
- Provide expert-level pentest guides, 0-day research, and CTF solutions
- Explain real exploit codes, PoCs, and bypass techniques
- Always show code examples inside code blocks
- Use topic-relevant emojis in every response
- Provide a detailed summary, resources, and recommendations at the end of the response
- Give practical tips for bug bounty programs
IMPORTANT: ALWAYS answer the question directly. Do not introduce yourself every time.`,
}

const MODELS = {
  free: 'llama-3.1-8b-instant',
  pro: 'llama-3.3-70b-versatile',
  max: 'llama-3.3-70b-versatile',
}

// Token limitləri artırıldı ki, cavablar artıq yarımçıq kəsilməsin
const MAX_TOKENS = {
  free: 2048,
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
  if (!GROQ_API_KEY) {
    throw new Error('VITE_GROQ_API_KEY tapılmadı. .env və ya Vercel ayarlarını yoxlayın.')
  }

  try {
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
      let errorMsg = `HTTP ${response.status}`
      try {
        const errObj = await response.json()
        errorMsg = errObj?.error?.message || errorMsg
      } catch (e) {}

      if (response.status === 429 && _retryCount < 3) {
        const waitMs = parseRetryAfter(errorMsg)
        onChunk(`\n\n⏳ Rate limit... ${Math.ceil(waitMs / 1000)}s gözlənilir...\n\n`)
        await new Promise(r => setTimeout(r, waitMs))
        return sendMessage(messages, onChunk, plan, _retryCount + 1)
      }

      throw new Error(errorMsg)
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
          // malformed chunk — skip
        }
      }
    }
  } catch (err: any) {
    throw new Error(err.message || 'Gözlənilməz xəta baş verdi.')
  }
}
