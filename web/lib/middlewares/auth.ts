import { ASSET_CONTRIBUTOR, ASSET_OWNER } from '@/constants'
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

    const [isPartOfAsset, isProjectAdmin] = await prisma.$transaction([
      prisma.asset.findFirst({
        where: {
          projectId: projectId,
          members: {
            some: {
              userId: Number(user.id),
            },
          },
        },
      }),
      prisma.projectAdmin.findFirst({
        where: {
          projectId: projectId,
          userId: user?.id,
        },
      }),
    ])

    if (!isPartOfAsset && !isProjectAdmin) {
      return res.status(403).json({
        success: false,
        error: UNAUTHORIZED,
      })
    }

    await handler(req, res)
  }
}

const hasOwnerAccessToAsset = (handler: NextApiHandler) => {
  return async (req: NextApiRequest, res: NextApiResponse<ApiRes<string>>) => {
    const assetId = req.query.assetId as string
    const sessionToken = req.headers.sessiontoken as string
    const user = await getUserInfoFromSessionToken(sessionToken)

    const isAllowed = await prisma.assetMemberRole.findFirst({
      where: {
        assetId: assetId,
        role: ASSET_OWNER,
        userId: user?.id,
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

const hasContributorAccessToAsset = (handler: NextApiHandler) => {
  return async (req: NextApiRequest, res: NextApiResponse<ApiRes<string>>) => {
    const assetId = req.query.assetId as string
    const sessionToken = req.headers.sessiontoken as string
    const user = await getUserInfoFromSessionToken(sessionToken)

    const isAllowed = await prisma.assetMemberRole.findFirst({
      where: {
        assetId: assetId,
        userId: user?.id,
        OR: [{ role: ASSET_OWNER }, { role: ASSET_CONTRIBUTOR }],
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

const hasViewerAccessToAsset = (handler: NextApiHandler) => {
  return async (req: NextApiRequest, res: NextApiResponse<ApiRes<string>>) => {
    const assetId = req.query.assetId as string
    const sessionToken = req.headers.sessiontoken as string
    const user = await getUserInfoFromSessionToken(sessionToken)

    const isAllowed = await prisma.assetMemberRole.findFirst({
      where: {
        assetId: assetId,
        userId: user?.id,
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
  hasOwnerAccessToAsset,
  hasContributorAccessToAsset,
  hasViewerAccessToAsset,
}
