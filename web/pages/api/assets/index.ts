import { getUserInfoFromSessionToken } from '@/lib/auth'
import {
  hasContributorAccessToKg,
  hasViewerAccessToKg,
} from '@/lib/auth/access'
import { prisma } from '@/lib/prisma'
import { sendMessageToPythonService } from '@/lib/redis'
import getIngestionPayload from '@/lib/utils/readerKwargsParser'
import type { ApiRes } from '@/types/api'
import { Asset, CreateAssetData } from '@/types/assets'
import { NextApiRequest, NextApiResponse } from 'next'

type PrismaAssetRecord = {
  id: string
  knowledgeGroupId: string
  name: string
  assetTypeId: string
  description: string | null
  tags: string | null
  ownerUserId: number
  status: string
  isActive: boolean
  createdBy: string
  createdAt: Date
}

const processTags = (asset: PrismaAssetRecord): Asset => {
  return {
    ...asset,
    description: asset.description || undefined,
    createdAt: asset.createdAt.toISOString(),
    tags: asset.tags?.split(',').map((tag) => tag?.trim()) || [],
  }
}

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<Asset | Asset[]>>
) => {
  const projectId = req.query.projectId as string
  const kgId = req.query.kgId as string
  const sessionToken = req.headers.sessiontoken as string
  const user = await getUserInfoFromSessionToken(sessionToken)

  switch (req.method) {
    case 'GET': {
      const kgViewAllowed = await hasViewerAccessToKg(kgId, Number(user?.id))

      if (!kgViewAllowed) {
        return res.status(404).json({
          success: false,
          error: 'Resource not found',
        })
      }

      const kgs = await prisma.asset.findMany({
        where: {
          knowledgeGroupId: kgId,
          isActive: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      res.status(200).json({
        success: true,
        data: kgs.map((e) => processTags(e)),
      })
      break
    }
    case 'POST': {
      const body: CreateAssetData = req.body
      console.log({ body })

      const kgContributorAccess = await hasContributorAccessToKg(
        kgId,
        Number(user?.id)
      )

      if (!kgContributorAccess) {
        return res.status(403).json({
          success: false,
          error:
            'User needs atleast contributor access in the knowledge group to be able to create an asset.',
        })
      }

      const newAsset = await prisma.$transaction(async (tx) => {
        const assetType = await tx.assetType.findFirst({
          where: {
            id: body.assetTypeId,
          },
          select: {
            key: true,
          },
        })
        if (!assetType?.key) {
          res.status(400).json({
            success: false,
            error: 'Unknown Asset Type',
          })
          throw new Error('Unknown Asset Type')
        }

        // create asset
        const newA = await tx.asset.create({
          data: {
            name: body.name,
            knowledgeGroupId: kgId,
            description: body.description,
            tags: body.tags,
            createdBy: user?.email as string,
            ownerUserId: user?.id as number,
            assetTypeId: body.assetTypeId,
            readerKwargs: JSON.stringify(body.readerKwargs),
            extraMetadata: body?.extraMetadata as any,
          },
        })

        sendMessageToPythonService(
          JSON.stringify({
            job_type: 'ingestion',
            payload: getIngestionPayload({
              assetId: newA.id,
              assetType: assetType.key,
              knowledgeGroupId: kgId,
              projectId: projectId,
              kwargs: body?.readerKwargs,
              extra_metadata: body?.extraMetadata,
            }),
          })
        )
        return newA
      })

      res.status(201).json({
        success: true,
        data: processTags(newAsset),
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
