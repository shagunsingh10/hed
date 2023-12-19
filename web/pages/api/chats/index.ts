import { addNewChat, getAllChats } from '@/lib/controllers/chats'
import ApiRouteHandler from '@/lib/utils/apihandler'

export default ApiRouteHandler({
  GET: getAllChats,
  POST: addNewChat,
})
