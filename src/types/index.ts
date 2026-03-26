export interface User {
  id: string
  email: string
  full_name: string
  plan: 'free' | 'pro' | 'max'
  tokens_used: number
  tokens_limit: number
  created_at: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface Chat {
  id: string
  user_id: string
  title: string
  messages: Message[]
  created_at: Date
}
