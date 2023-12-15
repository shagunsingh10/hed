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
  sources?: Record<string, any>[]
}

export interface ChatWithoutMessage {
  id: string
  title: string | null
  userId: number
  projectId: string | null
  createdAt: Date
  lastMessageAt: Date
}

export interface MessagesSlice {
  waitingForResponse: boolean
  streaming: boolean
  messages: Message[] | undefined
  addMessage: (m: Message) => void
  postQuery: (chatId: string, query: string) => Promise<void>
  setMessages: (messages: Message[]) => void
  resetMessages: () => void
}

export interface ChatsSlice {
  chats: ChatWithoutMessage[]
  setChats: (chats: ChatWithoutMessage[]) => void
  activeChat: ChatWithoutMessage | undefined
  setActiveChat: (chatId: string) => void
  addChat: (chat: ChatWithoutMessage) => void
  deleteteChat?: () => void
}
