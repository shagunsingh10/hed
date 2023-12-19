import { getAllDocsInAsset } from '@/lib/controllers/docs'
import { hasViewerAccessToKg } from '@/lib/middlewares/auth'
import ApiRouteHandler from '@/lib/utils/apihandler'

export default ApiRouteHandler({
  POST: hasViewerAccessToKg(getAllDocsInAsset),
})
