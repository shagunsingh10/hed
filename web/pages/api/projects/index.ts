import { createNewProject, getAllProjects } from '@/lib/controllers/projects'
import ApiRouteHandler from '@/lib/utils/apihandler'

export default ApiRouteHandler({
  GET: getAllProjects,
  POST: createNewProject,
})
