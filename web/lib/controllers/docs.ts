import { prisma } from '@/lib/prisma'
import { ApiRes } from '@/types/api'
import { Doc } from '@/types/assets'
import { NextApiRequest, NextApiResponse } from 'next'

export const getAllDocsInAsset = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<Doc[]>>
) => {
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
}
