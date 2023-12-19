import { KG_OWNER } from '@/constants'
import { getUserInfoFromSessionToken } from '@/lib/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { type ApiRes } from '@/types/api'
import { type Kg } from '@/types/kgs'
import type { KnowledgeGroup } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'

const processTags = (knowledgeGroup: KnowledgeGroup): Kg => {
  return {
    ...knowledgeGroup,
    createdAt: knowledgeGroup.createdAt.toString(),
    tags: knowledgeGroup.tags?.split(',').map((tag) => tag?.trim()) || [],
  }
}

export const getAllKnowledgeGroupsInProject = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<Kg[]>>
) => {
  const projectId = req.query.projectId as string
  const sessionToken = req.headers.sessiontoken as string
  const user = await getUserInfoFromSessionToken(sessionToken)

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
  })

  res.status(200).json({
    success: true,
    data: kgs.map((e) => processTags(e)),
  })
}

export const createKnowledgeGroupInProject = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<Kg>>
) => {
  const projectId = req.query.projectId as string
  const sessionToken = req.headers.sessiontoken as string
  const user = await getUserInfoFromSessionToken(sessionToken)

  if (!user?.id) {
    return res.status(201).json({
      success: false,
      error: 'User not found',
    })
  }

  const newKg = await prisma.knowledgeGroup.create({
    data: {
      name: req.body.name,
      projectId: projectId,
      description: req.body.description,
      tags: req.body.tags,
      createdBy: user?.email as string,
      UserRole: {
        create: {
          userId: user?.id,
          role: KG_OWNER,
        },
      },
    },
  })

  res.status(201).json({
    success: true,
    data: processTags(newKg),
  })
}

export const getKnowledgeGroupById = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<Kg>>
) => {
  const kgId = req.query.kgId as string
  const sessionToken = req.headers.sessiontoken as string
  const user = await getUserInfoFromSessionToken(sessionToken)

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
}

export const getMembersInKnowledgeGroup = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const kgId = req.query.kgId as string

  const kgUsers = await prisma.user.findMany({
    where: {
      UserRole: {
        some: {
          knowledgeGroupId: kgId,
        },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      UserRole: {
        select: {
          role: true,
        },
      },
    },
  })

  res.status(200).json({
    success: true,
    data: kgUsers.map((e) => ({ ...e, role: e.UserRole[0].role })),
  })
}

export const addMemberInKnowledgeGroup = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<boolean>>
) => {
  const userId = Number(req.body.userId)
  const role = req.body.role as string
  const kgId = req.query.kgId as string

  await prisma.userRole.create({
    data: {
      knowledgeGroupId: kgId,
      userId: userId,
      role: role,
    },
  })

  res.status(201).json({
    success: true,
    data: true,
  })
}

export const removeMemberFromKnowledgeGroupByUserId = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<boolean>>
) => {
  const userId = Number(req.body.userId)
  const kgId = req.query.kgId as string

  await prisma.userRole.delete({
    where: {
      UserKnowledgeGroupIndex: {
        userId: userId,
        knowledgeGroupId: kgId,
      },
    },
  })

  res.status(201).json({
    success: true,
    data: true,
  })
}
