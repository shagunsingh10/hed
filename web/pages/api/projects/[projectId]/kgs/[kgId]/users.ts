import {
  addMemberInKnowledgeGroup,
  getMembersInKnowledgeGroup,
  removeMemberFromKnowledgeGroupByUserId,
} from '@/lib/controllers/kgs'
import { hasOwnerAccessToKg, hasViewerAccessToKg } from '@/lib/middlewares/auth'
import ApiRouteHandler from '@/lib/utils/apihandler'

export default ApiRouteHandler({
  GET: hasViewerAccessToKg(getMembersInKnowledgeGroup),
  POST: hasOwnerAccessToKg(addMemberInKnowledgeGroup),
  DELETE: hasOwnerAccessToKg(removeMemberFromKnowledgeGroupByUserId),
})
