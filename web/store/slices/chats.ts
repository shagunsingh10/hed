import { postQueryApi } from '@/apis/chats'
import type { ChatsSlice, Message, MessagesSlice } from '@/types/chats'
import type { ProjectsSlice } from '@/types/projects'
import { StateCreator } from 'zustand'

export const createChatsSlice: StateCreator<
  ProjectsSlice & ChatsSlice & MessagesSlice,
  [],
  [],
  ChatsSlice
> = (set, get) => ({
  chats: [],
  setChats: (chats) => {
    set({
      chats: chats,
      messages: [],
      activeChat: chats ? chats[0] : undefined,
    })
  },
  activeChat: undefined,
  setActiveChat: (chatId) => {
    const activeChat = get().chats.find((e) => e.id === chatId)
    set({
      activeChat: activeChat,
    })
  },
  addChat: (newChat) => {
    set({
      chats: [newChat, ...get().chats],
      activeChat: newChat,
    })
  },
})

export const createMessagesSlice: StateCreator<
  MessagesSlice & ChatsSlice,
  [],
  [],
  MessagesSlice
> = (set, get) => ({
  waitingForResponse: false,
  messages: [],
  streaming: false,
  addMessage: (m) => {
    if (get().activeChat?.id == m.chatId) {
      const messages = get().messages || []
      // if we are streaming and the message is complete -> replace last message with the final message
      // we recieve the full response in final message
      if (m.complete) {
        if (get().streaming) messages?.pop()
        set({
          waitingForResponse: false,
          streaming: false,
          messages: [...messages, m],
        })
      } else {
        // if we are streaming response -> add the current message chunk response to last message
        if (get().streaming) {
          const currentMessage = messages?.pop()
          if (currentMessage) {
            m.content = currentMessage.content + m.content
          }
        }
        if (m.content == '') m.content = ' ' // when streaming starts box shrinks -> to fix that
        set({
          waitingForResponse: false,
          streaming: true,
          messages: [...messages, m],
        })
      }
    }
  },
  postQuery: async (chatId, query) => {
    const newMessage: Message = await postQueryApi(chatId, query)
    set({
      waitingForResponse: true,
      messages: [...(get().messages || []), newMessage],
    })
    // automatically stop waiting for response in 10 seconds
    setTimeout(() => {
      set({
        waitingForResponse: false,
      })
    }, 15000)
  },
  setMessages: (messages) => {
    set({
      messages: messages,
    })
  },
  resetMessages: async () => {
    set({
      messages: [],
      activeChat: undefined,
    })
  },
})
