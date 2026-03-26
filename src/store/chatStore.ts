import { create } from 'zustand'
import type { Chat, Message } from '../types'

interface ChatState {
  chats: Chat[]
  currentChatId: string | null
  addChat: () => string
  addMessage: (chatId: string, message: Message) => void
  setCurrentChat: (id: string) => void
  deleteChat: (id: string) => void
  getCurrentChat: () => Chat | null
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  currentChatId: null,

  addChat: () => {
    const id = Date.now().toString()
    const newChat: Chat = {
      id,
      title: 'Yeni Söhbət',
      messages: [],
      created_at: new Date(),
    }
    set((state) => ({ chats: [newChat, ...state.chats], currentChatId: id }))
    return id
  },

  addMessage: (chatId: string, message: Message) => {
    set((state) => ({
      chats: state.chats.map((chat) => {
        if (chat.id !== chatId) return chat
        const title = chat.messages.length === 0 && message.role === 'user'
          ? message.content.slice(0, 30) + '...'
          : chat.title
        return { ...chat, title, messages: [...chat.messages, message] }
      }),
    }))
  },

  setCurrentChat: (id: string) => set({ currentChatId: id }),

  deleteChat: (id: string) => {
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