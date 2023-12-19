import { config as appConfig } from '@/config'
import { prisma } from '@/lib/prisma'
import { sendAssetStatusNotification } from '@/lib/socket/assets'
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
      const user = req.body.user as string
      const documents: Doc[] = req.body.documents

      if (apiKey != appConfig.serviceApiKey) {
        return res.status(401).json({ success: false })
      }

      // logs
      if (status === 'deleted') {
        await prisma.asset.delete({
          where: {
            id: assetId,
          },
          include: {
            docs: true,
          },
        })
      } else {
        await prisma.asset.update({
          where: {
            id: assetId,
          },
          data: {
            status: status,
            docs: {
              createMany: {
                data:
                  documents?.map((doc) => ({
                    doc_id: doc.id,
                    name: doc.name,
                  })) || [],
              },
            },
          },
        })
      }

      // Notify user on the status
      const io = res.socket.server.io
      if (io) await sendAssetStatusNotification(io, user, { assetId, status })

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
