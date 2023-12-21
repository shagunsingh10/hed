import {
  getPaginatedAssetsInProject,
  raiseAssetCreationRequest,
} from '@/lib/controllers/assets'
import { isPartOfProject } from '@/lib/middlewares/auth'
import ApiRouteHandler from '@/lib/utils/apihandler'

export default ApiRouteHandler({
  GET: isPartOfProject(getPaginatedAssetsInProject),
  POST: raiseAssetCreationRequest,
})
