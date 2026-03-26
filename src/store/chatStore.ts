import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Chat, Message } from '../types'

interface ChatState {
  chats: Chat[]
  currentChatId: string | null
  loadChats: (userId: string) => Promise<void>
  addChat: (userId: string) => Promise<string>
  addMessage: (chatId: string, message: Message) => Promise<void>
  setCurrentChat: (id: string) => void
  deleteChat: (id: string) => Promise<void>
  getCurrentChat: () => Chat | null
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  currentChatId: null,

  loadChats: async (userId: string) => {
    const { data: chats, error } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error || !chats) return

    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .in('chat_id', chats.map((c) => c.id))
      .order('timestamp', { ascending: true })

    const chatsWithMessages: Chat[] = chats.map((chat) => ({
      ...chat,
      created_at: new Date(chat.created_at),
      messages: (messages || [])
        .filter((m) => m.chat_id === chat.id)
        .map((m) => ({
          id: m.id,
          role: m.role as 'user' | 'assistant',
          content: m.content,
          timestamp: new Date(m.timestamp),
        })),
    }))

    set({ chats: chatsWithMessages })
  },

  addChat: async (userId: string) => {
    const id = Date.now().toString()
    const newChat: Chat = {
      id,
      user_id: userId,
      title: 'Yeni Söhbət',
      messages: [],
      created_at: new Date(),
    }

    await supabase.from('chats').insert({
      id,
      user_id: userId,
      title: 'Yeni Söhbət',
      created_at: newChat.created_at.toISOString(),
    })

    set((state) => ({
      chats: [newChat, ...state.chats],
      currentChatId: id,
    }))

    return id
  },

  addMessage: async (chatId: string, message: Message) => {
    await supabase.from('messages').insert({
      id: message.id,
      chat_id: chatId,
      role: message.role,
      content: message.content,
      timestamp: message.timestamp.toISOString(),
    })

    set((state) => ({
      chats: state.chats.map((chat) => {
        if (chat.id !== chatId) return chat

        const isFirstMessage = chat.messages.length === 0 && message.role === 'user'
        const title = isFirstMessage
          ? message.content.slice(0, 30) + '...'
          : chat.title

        if (isFirstMessage) {
          supabase
            .from('chats')
            .update({ title })
            .eq('id', chatId)
            .then(() => {})
        }

        return { ...chat, title, messages: [...chat.messages, message] }
      }),
    }))
  },

  setCurrentChat: (id: string) => set({ currentChatId: id }),

  deleteChat: async (id: string) => {
    await supabase.from('chats').delete().eq('id', id)

    set((state) => ({
      chats: state.chats.filter((c) => c.id !== id),
      currentChatId: state.currentChatId === id ? null : state.currentChatId,
    }))
  },

  getCurrentChat: () => {
    const { chats, currentChatId } = get()
    return chats.find((c) => c.id === currentChatId) || null
  },
}))
