import { getAssetsPendingReviewCount } from '@/lib/controllers/assets'
import ApiRouteHandler from '@/lib/utils/apihandler'

export default ApiRouteHandler({
  GET: getAssetsPendingReviewCount,
})
