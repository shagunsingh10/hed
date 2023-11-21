import { prisma } from '@/lib/prisma'
import type { ApiRes } from '@/types/api'
import { AssetType } from '@/types/assets'
import { NextApiRequest, NextApiResponse } from 'next'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<AssetType[]>>
) => {
  switch (req.method) {
    case 'GET': {
      const assetTypes = await prisma.assetType.findMany({
        select: {
          id: true,
          name: true,
          key: true,
        },
      })
      res.status(200).json({
        success: true,
        data: assetTypes,
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
