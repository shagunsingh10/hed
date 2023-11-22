import { prisma } from '@/lib/prisma'
import type { ApiRes } from '@/types/api'
import { User } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<User[]>>
) => {
  switch (req.method) {
    case 'GET': {
      const users = await prisma.user.findMany({
        orderBy: {
          name: 'asc',
        },
      })
      res.status(200).json({
        success: true,
        data: users,
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
