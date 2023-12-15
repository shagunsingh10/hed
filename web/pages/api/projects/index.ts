import { getUserInfoFromSessionToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getUniqueItemsByProperties } from '@/lib/utils/functions'
import type { ApiRes } from '@/types/api'
import { Project } from '@/types/projects'
import { User } from '@/types/users'
import { NextApiRequest, NextApiResponse } from 'next'

type PrismaProjectRecord = {
  id: string
  name: string
  description: string | null
  tags: string | null
  isActive: boolean
  createdBy: string
  createdAt: Date
  knowledgeGroups?: any
}

const processTags = (project: PrismaProjectRecord): Project => {
  const processed = {
    ...project,
    members: getUniqueItemsByProperties(
      project?.knowledgeGroups?.flatMap(
        (kg: any) => kg?.UserRole?.map((user: any) => user.User)
      ) as User[],
      'id'
    ),
    tags: project.tags?.split(',').map((tag) => tag?.trim()) || [],
  }
  delete processed['knowledgeGroups']
  return processed
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
          knowledgeGroups: {
            some: {
              UserRole: {
                some: {
                  userId: user?.id,
                },
              },
            },
          },
          isActive: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          admins: true,
          knowledgeGroups: {
            select: {
              UserRole: {
                select: {
                  User: {
                    select: {
                      name: true,
                      id: true,
                    },
                  },
                },
              },
            },
          },
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
      if (!user?.id) {
        return res.status(201).json({
          success: false,
          error: 'User not found',
        })
      }
      const newProject = await prisma.$transaction(async (tx) => {
        const proj = await tx.project.create({
          data: {
            name: body.name,
            description: body.description,
            tags: body.tags,
            createdBy: user?.email as string,
            admins: {
              create: {
                userId: user?.id,
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
                userId: user?.id,
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
