import { prisma } from '@/lib/prisma'
import type { ApiRes } from '@/types/api'
import { NextApiRequest, NextApiResponse } from 'next'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<string>>
) => {
  switch (req.method) {
    case 'GET': {
      const id = Number(req.query.id)
      const user = await prisma.user.findFirst({
        where: {
          id: id,
        },
        select: {
          image: true,
        },
      })
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        })
      }
      res.status(200).json({
        success: true,
        data: user.image as string,
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
