import type { Server as HTTPServer } from 'http'
import type { Socket as NetSocket } from 'net'
import { SOCKET_CONNECTION_MESSAGE } from '@/lib/socket/events'
import { saveSocketClientId } from '@/lib/socket/utils'
import type { NextApiRequest, NextApiResponse } from 'next'
import { Server, type Server as IOServer } from 'socket.io'

export const config = {
  api: {
    bodyParser: false,
  },
}

interface SocketServer extends HTTPServer {
  io?: IOServer | undefined
}

interface SocketWithIO extends NetSocket {
  server: SocketServer
}

export interface NextApiResponseWithSocket<Data = unknown>
  extends NextApiResponse<Data> {
  socket: SocketWithIO
}

const ioHandler = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (!res.socket.server.io) {
    console.log('*Starting Socket.IO server')

    const io = new Server(res.socket.server)

    io.on('connection', (socket) => {
      socket.on(SOCKET_CONNECTION_MESSAGE, ({ userId }: { userId: string }) => {
        saveSocketClientId(userId, socket.id)
      })
    })

    res.socket.server.io = io
  } else {
    console.log('socket.io already running')
  }
  res.end()
}

export default ioHandler
