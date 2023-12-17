import { getUserInfoFromSessionToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ApiRes } from '@/types/api'
import { Doc } from '@/types/assets'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<Doc[]>>
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

      const docs = await prisma.doc.findMany({
        where: {
          assetId: assetId,
        },
        include: {
          DocStatus: {
            select: {
              id: true,
              status: true,
              error: true,
              message: true,
              timestamp: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      })

      res.status(200).json({ success: true, data: docs })
    } catch (error) {
      console.error('Error fetching docs:', error)
      res.status(500).json({ success: false, error: 'Internal Server Error' })
    }
  } else {
    // Method not allowed
    res.status(405).json({ success: false, error: 'Method Not Allowed' })
  }
}
