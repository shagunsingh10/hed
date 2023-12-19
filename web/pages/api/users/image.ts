import { getUserImageSrc } from '@/lib/controllers/users'
import ApiRouteHandler from '@/lib/utils/apihandler'

export default ApiRouteHandler({
  GET: getUserImageSrc,
})
