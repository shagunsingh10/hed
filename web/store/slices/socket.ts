import { StateCreator } from "zustand";
import { SocketSlice } from "@/types/socket";

export const createSocketSlice: StateCreator<
  SocketSlice,
  [],
  [],
  SocketSlice
> = (set, get) => ({
  socket: null,
  setSocket: async (socket) => {
    set({
      socket: socket,
    });
  },
});
