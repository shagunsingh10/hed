import { getUserInfoFromSessionToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ApiRes } from '@/types/api'
import { AssetLog } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<AssetLog[]>>
) {
  const sessionToken = req.headers.sessiontoken as string
  const user = await getUserInfoFromSessionToken(sessionToken)

  if (!user) {
    return res.status(401).json({
      success: true,
      error: 'Unauthorized',
    })
  }

  if (req.method === 'GET') {
    try {
      const assetId = req.query.id as string

      const assetLogs = await prisma.assetLog.findMany({
        where: {
          assetId: assetId,
        },
        orderBy: {
          timestamp: 'desc',
        },
      })

      res.status(200).json({ success: true, data: assetLogs })
    } catch (error) {
      console.error('Error deleting file:', error)
      res.status(500).json({ success: false, error: 'Internal Server Error' })
    }
  } else {
    // Method not allowed
    res.status(405).json({ success: false, error: 'Method Not Allowed' })
  }
}
