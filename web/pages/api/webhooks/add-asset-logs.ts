import { config as appConfig } from '@/config'
import { prisma } from '@/lib/prisma'
import type { ApiRes } from '@/types/api'
import { NextApiRequest } from 'next'
import type { NextApiResponseWithSocket } from '../socket'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponseWithSocket<ApiRes<string>>
) => {
  switch (req.method) {
    case 'POST': {
      const assetId = req.body.assetId as string
      const apiKey = req.body.apiKey as string
      const log = req.body.log as string
      const type = req.body.type as string

      if (apiKey != appConfig.serviceApiKey) {
        return res.status(401).json({ success: false })
      }

      // logs
      await prisma.assetLog.create({
        data: {
          assetId: assetId,
          content: log,
          type: type,
        },
      })

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
