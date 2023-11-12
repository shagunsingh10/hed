/* If you have some middlewares then replace 
StateCreator<MyState, [], [], MySlice> with 
StateCreator<MyState, Mutators, [], MySlice>.
For example, if you are using devtools then it will be 
StateCreator<MyState, [["zustand/devtools", never]], [], MySlice> 
*/
"use client";

import { create } from "zustand";
import {
  createChatsSlice,
  createProjectsSlice,
  createMessagesSlice,
  createKgsSlice,
  createAssetsSlice,
  createSocketSlice,
} from "./slices";
import type { MessagesSlice, ChatsSlice } from "@/types/chats";
import type { ProjectsSlice } from "@/types/projects";
import { KgsSlice } from "@/types/kgs";
import { AssetsSlice } from "@/types/assets";
import { SocketSlice } from "@/types/socket";

const useStore = create<
  ProjectsSlice &
    ChatsSlice &
    MessagesSlice &
    KgsSlice &
    AssetsSlice &
    SocketSlice
>()((...a) => ({
  ...createProjectsSlice(...a),
  ...createChatsSlice(...a),
  ...createMessagesSlice(...a),
  ...createKgsSlice(...a),
  ...createAssetsSlice(...a),
  ...createSocketSlice(...a),
}));

export default useStore;
