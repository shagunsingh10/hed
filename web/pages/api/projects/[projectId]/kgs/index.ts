import {
  createKnowledgeGroupInProject,
  getAllKnowledgeGroupsInProject,
} from '@/lib/controllers/kgs'
import { isPartOfProject, isProjectAdmin } from '@/lib/middlewares/auth'
import ApiRouteHandler from '@/lib/utils/apihandler'

export default ApiRouteHandler({
  GET: isPartOfProject(getAllKnowledgeGroupsInProject),
  POST: isProjectAdmin(createKnowledgeGroupInProject),
})
