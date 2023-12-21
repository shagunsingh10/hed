import { approveAssetCreationRequest } from '@/lib/controllers/assets'
import { hasOwnerAccessToAsset } from '@/lib/middlewares/auth'
import ApiRouteHandler from '@/lib/utils/apihandler'

export default ApiRouteHandler({
  POST: hasOwnerAccessToAsset(approveAssetCreationRequest),
})
