import { SocketSlice } from '@/types/socket'
import { StateCreator } from 'zustand'

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
    })
  },
})
