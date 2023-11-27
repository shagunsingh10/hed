import { prisma } from '@/lib/prisma'
import type { ApiRes } from '@/types/api'
import { User } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<User>>
) => {
  switch (req.method) {
    case 'GET': {
      const email = req.query.email as string
      const user = await prisma.user.findFirst({
        where: {
          email: email,
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
        data: user,
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
