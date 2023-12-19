import { approveAssetCreationRequest } from '@/lib/controllers/assets'
import { hasOwnerAccessToKg } from '@/lib/middlewares/auth'
import ApiRouteHandler from '@/lib/utils/apihandler'

export default ApiRouteHandler({
  POST: hasOwnerAccessToKg(approveAssetCreationRequest),
})
