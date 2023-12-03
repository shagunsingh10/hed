import { ASSET_INGESTION_PENDING } from '@/constants'
import { getUserInfoFromSessionToken } from '@/lib/auth'
import { hasOwnerAccessToKg } from '@/lib/auth/access'
import { prisma } from '@/lib/prisma'
import { sendMessageToPythonService } from '@/lib/redis'
import getIngestionPayload from '@/lib/utils/readerKwargsParser'
import type { ApiRes } from '@/types/api'
import { NextApiRequest, NextApiResponse } from 'next'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<null>>
) => {
  const sessionToken = req.headers.sessiontoken as string
  const user = await getUserInfoFromSessionToken(sessionToken)

  if (!user) {
    return res.status(401).json({
      success: true,
      error: 'Unauthorized',
    })
  }

  switch (req.method) {
    case 'POST': {
      const assetId = req.query.id as string
      const status = req.body.status

      // get the asset
      const asset = await prisma.asset.findFirst({
        where: {
          id: assetId,
        },
        include: {
          AssetType: true,
          KnowledgeGroup: {
            select: {
              projectId: true,
            },
          },
        },
      })

      if (!asset) {
        return res.status(404).json({
          success: false,
          error: 'Resource not found',
        })
      }

      // check if the user is admin
      const kgOwner = await hasOwnerAccessToKg(
        asset?.knowledgeGroupId,
        Number(user?.id)
      )

      if (!kgOwner) {
        return res.status(403).json({
          success: false,
          error: 'Only admins can approve assets',
        })
      }

      await prisma.$transaction(async (tx) => {
        const approved = status === ASSET_INGESTION_PENDING
        await Promise.all([
          tx.assetLog.create({
            data: {
              assetId: assetId,
              content: `Asset ${approved ? 'approved' : 'rejected'} by ${
                user.email
              }`,
            },
          }),
          tx.asset.update({
            where: {
              id: assetId,
            },
            data: {
              status: status,
            },
          }),
        ])
        if (status === ASSET_INGESTION_PENDING) {
          sendMessageToPythonService(
            JSON.stringify({
              job_type: 'ingestion',
              payload: getIngestionPayload({
                assetId: asset.id,
                assetType: asset.AssetType.key,
                knowledgeGroupId: asset.knowledgeGroupId,
                projectId: asset.KnowledgeGroup.projectId,
                user: asset.createdBy as string,
                kwargs: JSON.parse(asset.readerKwargs || '{}'),
                extra_metadata: asset?.extraMetadata as any,
              }),
            })
          )
        }
      })

      res.status(201).json({
        success: true,
        data: null,
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
