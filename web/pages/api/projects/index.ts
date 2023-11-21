import { getUserInfoFromSessionToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { ApiRes } from '@/types/api'
import { Project } from '@/types/projects'
import { NextApiRequest, NextApiResponse } from 'next'

type PrismaProjectRecord = {
  id: string
  name: string
  description: string | null
  tags: string | null
  isActive: boolean
  createdBy: string
  createdAt: Date
}

const processTags = (project: PrismaProjectRecord): Project => {
  return {
    ...project,
    tags: project.tags?.split(',').map((tag) => tag?.trim()) || [],
  }
}

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<Project | Project[]>>
) => {
  const sessionToken = req.headers.sessiontoken as string
  const user = await getUserInfoFromSessionToken(sessionToken)

  switch (req.method) {
    case 'GET': {
      const projects = await prisma.project.findMany({
        where: {
          UserRole: {
            some: {
              userId: user?.id,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
      res.status(200).json({
        success: true,
        data: projects.map((e) => processTags(e)),
      })
      break
    }
    case 'POST': {
      const body = await req.body
      const newProject = await prisma.$transaction(async (tx) => {
        const proj = await tx.project.create({
          data: {
            name: body.name,
            description: body.description,
            tags: body.tags,
            createdBy: user?.email as string,
            UserRole: {
              create: {
                role: 'owner',
                userId: Number(user?.id),
              },
            },
          },
        })
        await tx.knowledgeGroup.create({
          data: {
            name: 'Default',
            description: `Default knowledge group for ${body.name} project. Consider the default project as a shared space for all your open assets. Just a quick heads-up: since it's an open setup, anything you stash in there is accessible to everyone in the project. `,
            tags: body.tags,
            projectId: proj.id,
            createdBy: user?.email as string,
            UserRole: {
              create: {
                role: 'owner',
                userId: Number(user?.id),
                projectId: proj.id,
              },
            },
          },
        })
        return proj
      })

      res.status(201).json({
        success: true,
        data: processTags(newProject),
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
