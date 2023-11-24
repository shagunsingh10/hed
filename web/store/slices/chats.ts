import {
  addNewChatApi,
  getChatsApi,
  loadMessagesApi,
  postQueryApi,
} from '@/apis/chats'
import type {
  ChatsSlice,
  ChatWithoutMessage,
  Message,
  MessagesSlice,
} from '@/types/chats'
import type { ProjectsSlice } from '@/types/projects'
import { StateCreator } from 'zustand'

export const createChatsSlice: StateCreator<
  ProjectsSlice & ChatsSlice & MessagesSlice,
  [],
  [],
  ChatsSlice
> = (set, get) => ({
  chats: [],
  activeChatId: '',
  setActiveChatId: (chatId) => {
    set({
      activeChatId: chatId,
    })
  },
  loadChats: async (projectId?: string) => {
    const chats = projectId ? await getChatsApi(projectId) : await getChatsApi()
    // const latestChat = chats?.length > 0 ? chats[0].id : null
    // const messages = latestChat ? await loadMessagesApi(latestChat) : []
    set({
      chats: chats,
      messages: [],
    })
  },
  addChat: async (projectId) => {
    const newChat: ChatWithoutMessage = await addNewChatApi(projectId)
    set({
      chats: [...get().chats, newChat],
      activeChatId: newChat.id,
    })
    return newChat.id
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
  addMessage: (m: Message) => {
    if (get().activeChatId == m.chatId) {
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
    }, 30000)
  },
  loadMessages: async (chatId: string) => {
    set({
      messages: await loadMessagesApi(chatId),
    })
  },
  resetMessages: async () => {
    set({
      messages: [],
      activeChatId: '',
    })
  },
})
