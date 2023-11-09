/* If you have some middlewares then replace 
StateCreator<MyState, [], [], MySlice> with 
StateCreator<MyState, Mutators, [], MySlice>.
For example, if you are using devtools then it will be 
StateCreator<MyState, [["zustand/devtools", never]], [], MySlice> 
*/

import { create } from "zustand";
import { createChatsSlice, createProjectsSlice } from "./slices";
import type { ChatsSlice } from "types/chats";
import type { ProjectsSlice } from "types/projects";

const useStore = create<ProjectsSlice & ChatsSlice>()((...a) => ({
  ...createProjectsSlice(...a),
  ...createChatsSlice(...a),
}));

export default useStore;
