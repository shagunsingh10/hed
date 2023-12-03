import { SocketSlice } from '@/types/socket'
import { StateCreator } from 'zustand'

export const createSocketSlice: StateCreator<
  SocketSlice,
  [],
  [],
  SocketSlice
> = (set) => ({
  socket: null,
  setSocket: async (socket) => {
    set({
      socket: socket,
    })
  },
})
