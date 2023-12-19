import { KG_CONTRIBUTOR, KG_OWNER } from '@/constants'
import { UNAUTHENTICATED, UNAUTHORIZED } from '@/constants/errors'
import { ApiRes } from '@/types/api'
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import { getToken } from 'next-auth/jwt'
import { NextRequest } from 'next/server'
import { prisma } from '../prisma'

const secret = process.env.NEXTAUTH_SECRET as string

type IUser = {
  id: number
  name: string | null
  email: string | null
} | null

const getUserInfoFromSessionToken = async (
  sessionToken: string
): Promise<IUser> => {
  const session = await prisma.session.findFirst({
    where: {
      sessionToken: sessionToken,
    },
    select: {
      userId: true,
    },
  })
  const user = await prisma.user.findFirst({
    where: {
      id: session?.userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  })
  return user
}

const isAuthenticatedUser = async (req: NextRequest) => {
  const jwt = await getToken({ req, secret, raw: true })
  return jwt
}

const isProjectAdmin = (handler: NextApiHandler) => {
  return async (req: NextApiRequest, res: NextApiResponse<ApiRes<string>>) => {
    const projectId = req.query.projectId as string
    const sessionToken = req.headers.sessiontoken as string

    const user = await getUserInfoFromSessionToken(sessionToken)

    if (!user) {
      return res.status(401).json({
        success: false,
        error: UNAUTHENTICATED,
      })
    }

    const isAllowed = await prisma.projectAdmin.findFirst({
      where: {
        projectId: projectId,
        userId: Number(user.id),
      },
    })

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        error: UNAUTHORIZED,
      })
    }

    await handler(req, res)
  }
}

const isPartOfProject = (handler: NextApiHandler) => {
  return async (req: NextApiRequest, res: NextApiResponse<ApiRes<string>>) => {
    const projectId = req.query.projectId as string
    const sessionToken = req.headers.sessiontoken as string

    const user = await getUserInfoFromSessionToken(sessionToken)

    if (!user) {
      return res.status(401).json({
        success: false,
        error: UNAUTHENTICATED,
      })
    }

    const isAllowed = await prisma.knowledgeGroup.findFirst({
      where: {
        projectId: projectId,
        UserRole: {
          some: {
            userId: Number(user.id),
          },
        },
      },
    })

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        error: UNAUTHORIZED,
      })
    }

    await handler(req, res)
  }
}

const hasOwnerAccessToKg = (handler: NextApiHandler) => {
  return async (req: NextApiRequest, res: NextApiResponse<ApiRes<string>>) => {
    const kgId = req.query.kgId as string
    const sessionToken = req.headers.sessiontoken as string

    const user = await getUserInfoFromSessionToken(sessionToken)

    if (!user) {
      return res.status(401).json({
        success: false,
        error: UNAUTHENTICATED,
      })
    }

    const isAllowed = await prisma.knowledgeGroup.findFirst({
      where: {
        id: kgId,
        UserRole: {
          some: {
            AND: [
              { userId: Number(user.id) },
              {
                role: {
                  equals: KG_OWNER,
                },
              },
            ],
          },
        },
      },
    })

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        error: UNAUTHORIZED,
      })
    }

    await handler(req, res)
  }
}

const hasContributorAccessToKg = (handler: NextApiHandler) => {
  return async (req: NextApiRequest, res: NextApiResponse<ApiRes<string>>) => {
    const kgId = req.query.kgId as string
    const sessionToken = req.headers.sessiontoken as string

    const user = await getUserInfoFromSessionToken(sessionToken)

    if (!user) {
      return res.status(401).json({
        success: false,
        error: UNAUTHENTICATED,
      })
    }

    const isAllowed = await prisma.knowledgeGroup.findFirst({
      where: {
        id: kgId,
        UserRole: {
          some: {
            AND: [
              { userId: Number(user.id) },
              {
                OR: [
                  {
                    role: {
                      equals: KG_OWNER,
                    },
                  },
                  {
                    role: {
                      equals: KG_CONTRIBUTOR,
                    },
                  },
                ],
              },
            ],
          },
        },
      },
    })

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        error: UNAUTHORIZED,
      })
    }

    await handler(req, res)
  }
}

const hasViewerAccessToKg = (handler: NextApiHandler) => {
  return async (req: NextApiRequest, res: NextApiResponse<ApiRes<string>>) => {
    const kgId = req.query.kgId as string
    const sessionToken = req.headers.sessiontoken as string

    const user = await getUserInfoFromSessionToken(sessionToken)

    if (!user) {
      return res.status(401).json({
        success: false,
        error: UNAUTHENTICATED,
      })
    }

    const isAllowed = await prisma.knowledgeGroup.findFirst({
      where: {
        id: kgId,
        UserRole: {
          some: {
            userId: Number(user.id),
          },
        },
      },
    })

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        error: UNAUTHORIZED,
      })
    }

    await handler(req, res)
  }
}

export {
  getUserInfoFromSessionToken,
  isAuthenticatedUser,
  isProjectAdmin,
  isPartOfProject,
  hasOwnerAccessToKg,
  hasViewerAccessToKg,
  hasContributorAccessToKg,
}
