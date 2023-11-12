export interface PostMessage {
  content: string;
}
export interface Message {
  id: string;
  chatId: string;
  content: string;
  timestamp: Date;
  isResponse: boolean;
}
export interface ChatWithoutMessage {
  id: string;
  title: string | null;
  userId: number;
  projectId: string | null;
  createdAt: Date;
}

export interface MessagesSlice {
  messages: Message[] | undefined;
  addMessage: (m: Message) => void;
  postQuery: (chatId: string, query: string) => void;
  loadMessages: (chatId: string) => void;
}

export interface ChatsSlice {
  chats: ChatWithoutMessage[];
  activeChatId: string;
  setActiveChatId: (chatId: string) => void;
  loadChats: (scope: "generic" | "project", projectId?: string) => void;
  addChat: (projectId?: string) => Promise<string>;
  deleteteChat?: () => void;
}
