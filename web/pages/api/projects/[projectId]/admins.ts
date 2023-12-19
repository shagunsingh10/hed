import {
  addProjectAdmin,
  getProjectAdmins,
  removeProjectAdminByUserId,
} from '@/lib/controllers/projects'
import { isPartOfProject, isProjectAdmin } from '@/lib/middlewares/auth'
import ApiRouteHandler from '@/lib/utils/apihandler'

export default ApiRouteHandler({
  GET: isPartOfProject(getProjectAdmins),
  POST: isProjectAdmin(addProjectAdmin),
  DELETE: isProjectAdmin(removeProjectAdminByUserId),
})
