import { config as appConfig } from '@/config'
import { prisma } from '@/lib/prisma'
import { getSocketClientId } from '@/lib/socket/handler'
import type { ApiRes } from '@/types/api'
import { Doc } from '@/types/assets'
import { NextApiRequest } from 'next'
import type { NextApiResponseWithSocket } from '../socket'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponseWithSocket<ApiRes<string>>
) => {
  switch (req.method) {
    case 'PUT': {
      const status = req.body.status as string
      const assetId = req.body.assetId as string
      const apiKey = req.body.apiKey as string
      const documents: Doc[] = req.body.documents

      if (apiKey != appConfig.serviceApiKey) {
        return res.status(401).json({ success: false })
      }

      const [, knowledgeGroupMembers] = await prisma.$transaction([
        prisma.asset.update({
          where: {
            id: assetId,
          },
          data: {
            status: status,
            docs: {
              createMany: {
                data:
                  documents?.map((doc) => ({
                    vector_db_doc_id: doc.id,
                    name: doc.name,
                  })) || [],
              },
            },
          },
        }),
        prisma.userRole.findMany({
          where: {
            KnowledgeGroup: {
              assets: {
                some: {
                  id: assetId,
                },
              },
            },
          },
          select: {
            User: {
              select: {
                email: true,
              },
            },
          },
        }),
      ])

      // Notify knowledge group members
      const io = res.socket.server.io
      for (const member of knowledgeGroupMembers) {
        if (member.User.email && io) {
          getSocketClientId(member.User.email).then((socketId) => {
            if (socketId)
              io.to(socketId).emit('update-asset-status', {
                assetId: assetId,
                status: status,
              })
          })
        }
      }

      res.status(201).json({
        success: true,
        data: '',
      })
      break
    }
    case 'DELETE': {
      const assetId = req.body.assetId as string
      const apiKey = req.body.apiKey as string

      if (apiKey != appConfig.serviceApiKey) {
        return res.status(401).json({ success: false })
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [knowledgeGroupMembers, _] = await prisma.$transaction([
        prisma.userRole.findMany({
          where: {
            KnowledgeGroup: {
              assets: {
                some: {
                  id: assetId,
                },
              },
            },
          },
          select: {
            User: {
              select: {
                email: true,
              },
            },
          },
        }),
        prisma.asset.delete({
          where: {
            id: assetId,
          },
          include: {
            docs: true,
          },
        }),
      ])

      // Notify knowledge group members
      const io = res.socket.server.io
      for (const member of knowledgeGroupMembers) {
        if (member.User.email && io) {
          getSocketClientId(member.User.email).then((socketId) => {
            if (socketId)
              io.to(socketId).emit('update-asset-status', {
                assetId: assetId,
                status: 'deleted',
              })
          })
        }
      }

      res.status(201).json({
        success: true,
        data: '',
      })
      break
    }
    default:
      res.status(405).json({
        success: true,
        error: 'Method not allowed',
      })
      break
  }
}

export default handler
