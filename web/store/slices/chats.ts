import { StateCreator } from "zustand";
import type { ProjectsSlice } from "@/types/projects";
import type { ChatsSlice, MessagesSlice, Message } from "@/types/chats";

export const createChatsSlice: StateCreator<
  ProjectsSlice & ChatsSlice,
  [],
  [],
  ChatsSlice
> = (set, get) => ({
  chats: [],
  loadChats: async (scope) => {
    let newChats = [];
    if (scope === "generic") {
      newChats = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => ({
        id: `id ${i}`,
        title: i + " How to train a model?",
        userId: "string",
      }));
    } else {
      newChats = [
        11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
      ].map((i) => ({
        id: `id ${i}`,
        title: i + " How to train a model?",
        userId: "string",
      }));
    }

    set({
      chats: [...newChats],
    });
  },
});

export const createMessagesSlice: StateCreator<
  MessagesSlice,
  [],
  [],
  MessagesSlice
> = (set, get) => ({
  messages: [],
  addMessage: (m: Message) => {
    set({
      messages: [...(get().messages || []), m],
    });
  },
  loadMessages: async (chatId: string) => {
    set({
      messages: [],
    });
  },
});
