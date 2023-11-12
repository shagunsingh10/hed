import { StateCreator } from "zustand";
import type { ProjectsSlice } from "@/types/projects";
import type {
  ChatsSlice,
  MessagesSlice,
  Message,
  ChatWithoutMessage,
} from "@/types/chats";
import {
  addNewChatApi,
  getChatsApi,
  loadMessagesApi,
  postQueryApi,
} from "@/apis/chats";

export const createChatsSlice: StateCreator<
  ProjectsSlice & ChatsSlice,
  [],
  [],
  ChatsSlice
> = (set, get) => ({
  chats: [],
  activeChatId: "",
  setActiveChatId: (chatId) => {
    set({
      activeChatId: chatId,
    });
  },
  loadChats: async (scope, projectId?: string) => {
    const chats =
      scope == "project" ? await getChatsApi(projectId) : await getChatsApi();
    set({
      chats: chats,
    });
  },
  addChat: async (projectId) => {
    const newChat: ChatWithoutMessage = await addNewChatApi(projectId);
    set({
      chats: [...get().chats, newChat],
    });
    return newChat.id;
  },
});

export const createMessagesSlice: StateCreator<
  MessagesSlice & ChatsSlice,
  [],
  [],
  MessagesSlice
> = (set, get) => ({
  messages: [],

  addMessage: (m: Message) => {
    if (get().activeChatId == m.chatId) {
      set({
        messages: [...(get().messages || []), m],
      });
    }
  },
  postQuery: async (chatId, query) => {
    const newMessage: Message = await postQueryApi(chatId, query);
    set({
      messages: [...(get().messages || []), newMessage],
    });
  },
  loadMessages: async (chatId: string) => {
    set({
      messages: await loadMessagesApi(chatId),
    });
  },
});
