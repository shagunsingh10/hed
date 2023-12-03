import { getUserInfoFromSessionToken } from '@/lib/auth'
import { hasOwnerAccessToKg } from '@/lib/auth/access'
import { prisma } from '@/lib/prisma'
import type { ApiRes } from '@/types/api'
import { NextApiRequest, NextApiResponse } from 'next'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<boolean | unknown>>
) => {
  const sessionToken = req.headers.sessiontoken as string
  const user = await getUserInfoFromSessionToken(sessionToken)

  switch (req.method) {
    case 'GET': {
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
      break
    }
    case 'POST': {
      const body = await req.body
      const userId = Number(body.userId)
      const role = body.role as string
      const kgId = req.query.kgId as string

      if (!user?.id) {
        return res.status(201).json({
          success: false,
          error: 'User not found',
        })
      }

      const isAllowed = await hasOwnerAccessToKg(kgId, Number(user?.id))

      if (!isAllowed) {
        return res.status(403).json({
          success: false,
          error: 'Only owners can add members to knowledge groups',
        })
      }

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
      break
    }

    case 'DELETE': {
      const body = await req.body
      const userId = Number(body.userId)
      const kgId = req.query.kgId as string

      if (!user?.id) {
        return res.status(201).json({
          success: false,
          error: 'User not found',
        })
      }

      const isAllowed = await hasOwnerAccessToKg(kgId, Number(user?.id))

      if (!isAllowed) {
        return res.status(403).json({
          success: false,
          error: 'Only owners can remove members from knowledge groups',
        })
      }

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
