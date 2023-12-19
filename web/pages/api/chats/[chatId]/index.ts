import { getMessagesByChatId, postQuery } from '@/lib/controllers/chats'
import ApiRouteHandler from '@/lib/utils/apihandler'

export default ApiRouteHandler({
  GET: getMessagesByChatId,
  POST: postQuery,
})
