const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

const SYSTEM_PROMPT = `Sen ARN AI-san - kibertəhlükəsizlik sahəsində ixtisaslaşmış süni intellekt assistentisən. 
Azərbaycanca danışırsan. Penetration testing, etik hacking, network security, web security mövzularında ekspertisən.
Qısa, aydın və professional cavablar verirsən.`

export async function sendMessage(
  messages: { role: string; content: string }[],
  onChunk: (chunk: string) => void
): Promise<void> {
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      stream: true,
      max_tokens: 1024,
    }),
  })

  if (!response.ok) throw new Error('AI xətası')
  
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
      } catch {}
    }
  }
}