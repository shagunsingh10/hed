import { type Server } from 'socket.io'
import { CHAT_QUERY_REPLY_EVENT } from './events'
import { emitSocketEventToUser } from './utils'

type IChatQueryReply = {
  chatId: string
  response: string
  complete: boolean
  messageId?: string
  timestamp?: Date
  sources?: string[]
}

export const sendChatQueryResponse = async (
  io: Server,
  userId: string,
  payload: IChatQueryReply
) => {
  emitSocketEventToUser<IChatQueryReply>(
    io,
    CHAT_QUERY_REPLY_EVENT,
    userId,
    payload
  )
}
