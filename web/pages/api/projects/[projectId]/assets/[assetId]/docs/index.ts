import { getAllDocsInAsset } from '@/lib/controllers/docs'
import { hasViewerAccessToAsset } from '@/lib/middlewares/auth'
import ApiRouteHandler from '@/lib/utils/apihandler'

export default ApiRouteHandler({
  GET: hasViewerAccessToAsset(getAllDocsInAsset),
})
