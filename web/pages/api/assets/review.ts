import { ASSET_APPROVAL_PENDING } from '@/constants'
import { getUserInfoFromSessionToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { ApiRes } from '@/types/api'
import { NextApiRequest, NextApiResponse } from 'next'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<any>>
) => {
  const sessionToken = req.headers.sessiontoken as string
  const user = await getUserInfoFromSessionToken(sessionToken)

  if (!user) {
    return res.status(401).json({
      success: true,
      error: 'Unauthorized',
    })
  }

  switch (req.method) {
    case 'GET': {
      const kgs = await prisma.asset.findMany({
        where: {
          KnowledgeGroup: {
            UserRole: {
              some: {
                AND: [
                  { userId: user.id },
                  {
                    role: {
                      equals: 'owner',
                    },
                  },
                ],
              },
            },
          },
          isActive: true,
          status: ASSET_APPROVAL_PENDING,
        },
        include: {
          AssetType: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      res.status(200).json({
        success: true,
        data: kgs,
      })
      break
    }

    default: {
      res.status(405).json({
        success: true,
        error: 'Method not allowed',
      })
      break
    }
  }
}

export default handler
