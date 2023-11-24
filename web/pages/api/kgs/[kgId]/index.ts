import { getUserInfoFromSessionToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { ApiRes } from '@/types/api'
import { Project } from '@/types/projects'
import { NextApiRequest, NextApiResponse } from 'next'

type PrismaKgRecord = {
  id: string
  name: string
  projectId: string
  description: string | null
  tags: string | null
  isActive: boolean
  createdBy: string
  createdAt: Date
}

const processTags = (project: PrismaKgRecord): Project => {
  return {
    ...project,
    tags: project.tags?.split(',').map((tag) => tag?.trim()) || [],
  }
}

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<Project>>
) => {
  const sessionToken = req.headers.sessiontoken as string
  const user = await getUserInfoFromSessionToken(sessionToken)

  switch (req.method) {
    case 'GET': {
      const kgId = req.query.kgId as string

      const kg = await prisma.knowledgeGroup.findFirst({
        where: {
          id: kgId,
          isActive: true,
          UserRole: {
            some: {
              userId: user?.id,
            },
          },
        },
      })

      if (!kg)
        return res.status(404).json({
          success: false,
          error: 'Knowledge group not found',
        })

      res.status(200).json({
        success: true,
        data: processTags(kg),
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
