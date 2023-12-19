import {
  getPaginatedAssetsInKg,
  raiseAssetCreationRequest,
} from '@/lib/controllers/assets'
import {
  hasContributorAccessToKg,
  hasViewerAccessToKg,
} from '@/lib/middlewares/auth'
import ApiRouteHandler from '@/lib/utils/apihandler'

export default ApiRouteHandler({
  GET: hasViewerAccessToKg(getPaginatedAssetsInKg),
  POST: hasContributorAccessToKg(raiseAssetCreationRequest),
})
