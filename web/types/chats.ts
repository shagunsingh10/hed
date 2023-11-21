export interface PostMessage {
  content: string
}
export interface Message {
  id: string
  chatId: string
  content: string
  timestamp: Date
  isResponse: boolean
  complete?: boolean
}
export interface ChatWithoutMessage {
  id: string
  title: string | null
  userId: number
  projectId: string | null
  createdAt: Date
}

export interface MessagesSlice {
  waitingForResponse: boolean
  streaming: boolean
  messages: Message[] | undefined
  addMessage: (m: Message) => void
  postQuery: (chatId: string, query: string) => Promise<void>
  loadMessages: (chatId: string) => Promise<void>
}

export interface ChatsSlice {
  chats: ChatWithoutMessage[]
  activeChatId: string
  setActiveChatId: (chatId: string) => void
  loadChats: (scope: 'generic' | 'project', projectId?: string) => Promise<void>
  addChat: (projectId?: string) => Promise<string>
  deleteteChat?: () => void
}
