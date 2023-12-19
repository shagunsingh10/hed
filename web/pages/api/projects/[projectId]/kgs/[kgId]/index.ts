import { getKnowledgeGroupById } from '@/lib/controllers/kgs'
import { hasViewerAccessToKg } from '@/lib/middlewares/auth'
import ApiRouteHandler from '@/lib/utils/apihandler'

export default ApiRouteHandler({
  GET: hasViewerAccessToKg(getKnowledgeGroupById),
})
