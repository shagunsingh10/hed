import { deleteAssetById } from '@/lib/controllers/assets'
import { hasOwnerAccessToKg } from '@/lib/middlewares/auth'
import ApiRouteHandler from '@/lib/utils/apihandler'

export default ApiRouteHandler({
  DELETE: hasOwnerAccessToKg(deleteAssetById),
})
