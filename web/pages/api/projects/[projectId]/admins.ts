import { getUserInfoFromSessionToken } from '@/lib/auth'
import { isProjectAdmin } from '@/lib/auth/access'
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
  res: NextApiResponse<ApiRes<IProjectAdmins[] | boolean>>
) => {
  const sessionToken = req.headers.sessiontoken as string
  const user = await getUserInfoFromSessionToken(sessionToken)

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
    case 'POST': {
      const body = await req.body
      const userId = Number(body.userId)
      const projectId = req.query.projectId as string

      if (!user?.id) {
        return res.status(201).json({
          success: false,
          error: 'User not found',
        })
      }

      const isAllowed = await isProjectAdmin(projectId, Number(user?.id))

      if (!isAllowed) {
        return res.status(403).json({
          success: false,
          error: 'Only admins can add new admins',
        })
      }

      await prisma.projectAdmin.create({
        data: {
          projectId: projectId,
          userId: userId,
        },
      })

      res.status(201).json({
        success: true,
        data: true,
      })
      break
    }

    case 'DELETE': {
      const body = await req.body
      const userId = Number(body.userId)
      const projectId = req.query.projectId as string

      if (!user?.id) {
        return res.status(201).json({
          success: false,
          error: 'User not found',
        })
      }

      const isAllowed = await isProjectAdmin(projectId, Number(user?.id))

      if (!isAllowed) {
        return res.status(403).json({
          success: false,
          error: 'Only admins can remove admins',
        })
      }

      await prisma.projectAdmin.delete({
        where: {
          UserProjectIndex: {
            userId: userId,
            projectId: projectId,
          },
        },
      })

      res.status(200).json({
        success: true,
        data: true,
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
