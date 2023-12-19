import { getProjectById } from '@/lib/controllers/projects'
import { isPartOfProject } from '@/lib/middlewares/auth'
import ApiRouteHandler from '@/lib/utils/apihandler'

export default ApiRouteHandler({
  GET: isPartOfProject(getProjectById),
})
