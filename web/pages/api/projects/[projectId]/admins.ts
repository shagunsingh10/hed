import { prisma } from '@/lib/prisma'
import type { ApiRes } from '@/types/api'
import { NextApiRequest, NextApiResponse } from 'next'

type IProjectAdmins = {
  id: number
  name: string | null
  email: string | null
}

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<IProjectAdmins[]>>
) => {
  switch (req.method) {
    case 'GET': {
      const projectId = req.query.projectId as string

      const projectAdmins = await prisma.projectAdmin.findMany({
        where: {
          projectId: projectId,
        },
        select: {
          User: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      res.status(200).json({
        success: true,
        data: projectAdmins.map((e) => ({
          id: e.User.id,
          name: e.User.name,
          email: e.User.email,
        })),
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
