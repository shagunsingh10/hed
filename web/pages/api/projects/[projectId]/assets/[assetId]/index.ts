import { deleteAssetById } from '@/lib/controllers/assets'
import { hasOwnerAccessToAsset } from '@/lib/middlewares/auth'
import ApiRouteHandler from '@/lib/utils/apihandler'

export default ApiRouteHandler({
  DELETE: hasOwnerAccessToAsset(deleteAssetById),
})
