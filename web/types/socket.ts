import { Socket } from 'socket.io-client'

export type SocketSlice = {
  socket: Socket | null
  setSocket: (socket: Socket) => void
}
