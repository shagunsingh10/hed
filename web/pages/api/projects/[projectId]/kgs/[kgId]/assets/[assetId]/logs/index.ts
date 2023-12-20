import { getAssetLogsById } from '@/lib/controllers/assets'
import { hasViewerAccessToKg } from '@/lib/middlewares/auth'
import ApiRouteHandler from '@/lib/utils/apihandler'

export default ApiRouteHandler({
  GET: hasViewerAccessToKg(getAssetLogsById),
})
