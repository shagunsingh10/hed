import {
  addMemberToAsset,
  getAssetMembers,
  removeMemberFromAsset,
} from '@/lib/controllers/assets'
import {
  hasOwnerAccessToAsset,
  hasViewerAccessToAsset,
} from '@/lib/middlewares/auth'
import ApiRouteHandler from '@/lib/utils/apihandler'

export default ApiRouteHandler({
  GET: hasViewerAccessToAsset(getAssetMembers),
  POST: hasOwnerAccessToAsset(addMemberToAsset),
  DELETE: hasOwnerAccessToAsset(removeMemberFromAsset),
})
