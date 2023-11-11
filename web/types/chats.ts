export interface Message {
  id: string;
  chatId: string;
  content: string;
  timestamp: Date;
  isResponse: boolean;
}
export interface ChatWithoutMessage {
  id: string;
  title: string;
  userId: string;
  projectId?: string;
}

export interface MessagesSlice {
  messages: Message[] | undefined;
  addMessage: (m: Message) => void;
  loadMessages: (chatId: string) => void;
}

export interface ChatsSlice {
  chats: ChatWithoutMessage[];
  loadChats: (scope: "generic" | "project") => void;
  deleteteChat?: () => void;
}
