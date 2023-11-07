import { StateCreator } from "zustand";
import type { ProjectsSlice } from "types/projects";
import type { ChatsSlice } from "types/chats";

export const createChatsSlice: StateCreator<
  ProjectsSlice & ChatsSlice,
  [],
  [],
  ChatsSlice
> = (set, get) => ({
  chats: [],
});
