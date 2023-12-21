import { UNAUTHENTICATED } from '@/constants/errors'
import { getUserInfoFromSessionToken } from '@/lib/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { type ApiRes } from '@/types/api'
import { type Project } from '@/types/projects'
import { type Project as PrismaProject } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'

const processTags = (project: PrismaProject): Project => {
  return {
    ...project,
    tags: project.tags?.split(',').map((tag) => tag?.trim()) || [],
  }
}

export const getAllProjects = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<Project[]>>
) => {
  const sessionToken = req.headers.sessiontoken as string
  const user = await getUserInfoFromSessionToken(sessionToken)

  const projects = await prisma.project.findMany({
    where: {
      OR: [
        {
          assets: {
            some: {
              members: {
                some: {
                  userId: user?.id,
                },
              },
            },
          },
        },
        {
          admins: {
            some: {
              userId: user?.id,
            },
          },
        },
      ],
      isActive: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  res.status(200).json({
    success: true,
    data: projects.map((e) => processTags(e)),
  })
}

export const createNewProject = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<Project>>
) => {
  const sessionToken = req.headers.sessiontoken as string
  const user = await getUserInfoFromSessionToken(sessionToken)

  if (!user?.id) {
    return res.status(401).json({
      success: false,
      error: UNAUTHENTICATED,
    })
  }

  const newProject = await prisma.project.create({
    data: {
      name: req.body.name,
      description: req.body.description,
      tags: req.body.tags,
      createdBy: user?.email as string,
      admins: {
        create: {
          userId: user?.id,
        },
      },
    },
  })

  res.status(201).json({
    success: true,
    data: processTags(newProject),
  })
}

export const getProjectById = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<Project>>
) => {
  const id = req.query.projectId as string
  const project = await prisma.project.findFirst({
    where: {
      id: id,
      isActive: true,
    },
  })

  if (!project)
    return res.status(404).json({
      success: false,
      error: 'Project not found',
    })

  res.status(200).json({
    success: true,
    data: processTags(project),
  })
}

type IProjectAdmins = {
  id: number
  name: string | null
  email: string | null
}

export const getProjectAdmins = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<IProjectAdmins[]>>
) => {
  const projectId = req.query.projectId as string

  const projectAdmins = await prisma.projectAdmin.findMany({
    where: {
      projectId: projectId,
    },
    select: {
      user: {
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
    data: projectAdmins.map((e) => ({ ...e.user })),
  })
}

export const addProjectAdmin = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const userId = Number(req.body.userId)
  const projectId = req.query.projectId as string

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
}

export const removeProjectAdminByUserId = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const userId = Number(req.body.userId)
  const projectId = req.query.projectId as string

  await prisma.projectAdmin.delete({
    where: {
      projectAdminIndex: {
        userId: userId,
        projectId: projectId,
      },
    },
  })

  res.status(200).json({
    success: true,
    data: true,
  })
}
