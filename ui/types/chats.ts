interface MessageSlice {
  id: string;
  timestamp: Date;
  sender: string;
  body: string;
}

interface ChatSlice {
  id: string;
  title: string;
  messages: MessageSlice[] | undefined;
}

export interface ChatsSlice {
  chats: ChatSlice[] | undefined;
}
