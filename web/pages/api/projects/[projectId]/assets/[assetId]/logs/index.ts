import { getAssetLogsById } from '@/lib/controllers/assets'
import { hasViewerAccessToAsset } from '@/lib/middlewares/auth'
import ApiRouteHandler from '@/lib/utils/apihandler'

export default ApiRouteHandler({
  GET: hasViewerAccessToAsset(getAssetLogsById),
})
