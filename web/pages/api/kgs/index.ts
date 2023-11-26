import { getUserInfoFromSessionToken } from '@/lib/auth'
import { isProjectAdmin } from '@/lib/auth/access'
import { prisma } from '@/lib/prisma'
import type { ApiRes } from '@/types/api'
import { Kg } from '@/types/kgs'
import { NextApiRequest, NextApiResponse } from 'next'

type PrismaKgRecord = {
  id: string
  projectId: string
  name: string
  description: string | null
  tags: string | null
  isActive: boolean
  createdBy: string
  createdAt: Date
  UserRole?: any[]
}

const processTags = (project: PrismaKgRecord): Kg => {
  return {
    ...project,
    createdAt: project.createdAt.toString(),
    members: project.UserRole?.map((e) => ({ ...e.User, role: e.role })),
    tags: project.tags?.split(',').map((tag) => tag?.trim()) || [],
  }
}

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<Kg | Kg[]>>
) => {
  const projectId = req.query.projectId as string
  const sessionToken = req.headers.sessiontoken as string
  const user = await getUserInfoFromSessionToken(sessionToken)

  switch (req.method) {
    case 'GET': {
      const kgs = await prisma.knowledgeGroup.findMany({
        where: {
          projectId: projectId,
          isActive: true,
          UserRole: {
            some: {
              userId: user?.id,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          UserRole: {
            select: {
              User: true,
              role: true,
            },
          },
        },
      })
      res.status(200).json({
        success: true,
        data: kgs.map((e) => processTags(e)),
      })
      break
    }

    case 'POST': {
      const body = await req.body

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
          error: 'Only admins can create knowledge groups',
        })
      }

      const newKg = await prisma.knowledgeGroup.create({
        data: {
          name: body.name,
          projectId: projectId,
          description: body.description,
          tags: body.tags,
          createdBy: user?.email as string,
          UserRole: {
            create: {
              userId: user?.id,
              role: 'owner',
            },
          },
        },
      })

      res.status(201).json({
        success: true,
        data: processTags(newKg),
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
