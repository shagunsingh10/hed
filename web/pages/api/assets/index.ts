import { ASSET_APPROVAL_PENDING } from '@/constants'
import { ASSET_CREATION_NOT_AUTHORIZED } from '@/constants/errors'
import { getUserInfoFromSessionToken } from '@/lib/auth'
import {
  hasContributorAccessToKg,
  hasOwnerAccessToKg,
  hasViewerAccessToKg,
} from '@/lib/auth/access'
import { prisma } from '@/lib/prisma'
import { enqueueIngestionJob } from '@/lib/queue'
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

type IAssetResponse = {
  assets: Asset[]
  totalAssets: number
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
  res: NextApiResponse<ApiRes<Asset | IAssetResponse>>
) => {
  const kgId = req.query.kgId as string
  const sessionToken = req.headers.sessiontoken as string
  const user = await getUserInfoFromSessionToken(sessionToken)

  if (!user) {
    return res.status(401).json({
      success: true,
      error: 'Unauthorized',
    })
  }

  switch (req.method) {
    // ***************** GET **************** //
    case 'GET': {
      const start = Number(req.query.start)
      const end = Number(req.query.end)

      const kgViewAllowed = await hasViewerAccessToKg(kgId, Number(user.id))

      if (!kgViewAllowed) {
        return res.status(404).json({
          success: false,
          error: 'Resource not found',
        })
      }

      const [assets, count] = await prisma.$transaction([
        prisma.asset.findMany({
          where: {
            knowledgeGroupId: kgId,
            isActive: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          skip: start,
          take: end,
        }),
        prisma.asset.count({
          where: {
            knowledgeGroupId: kgId,
            isActive: true,
          },
        }),
      ])

      return res.status(200).json({
        success: true,
        data: { assets: assets.map((e) => processTags(e)), totalAssets: count },
      })
    }

    // ***************** POST **************** //
    case 'POST': {
      const body: CreateAssetData = req.body

      const [kgContributorAccess, kgOwner] = await Promise.all([
        hasContributorAccessToKg(kgId, Number(user?.id)),
        hasOwnerAccessToKg(kgId, Number(user?.id)),
      ])

      if (!kgContributorAccess) {
        return res.status(403).json({
          success: false,
          error: ASSET_CREATION_NOT_AUTHORIZED,
        })
      }

      const newAsset = await prisma.$transaction(async (tx) => {
        // Check valid asset type
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

        // Create a new asset record
        const newA = await tx.asset.create({
          data: {
            name: body.name,
            knowledgeGroupId: kgId,
            description: body.description,
            tags: body.tags,
            createdBy: user.email as string,
            ownerUserId: user.id as number,
            assetTypeId: body.assetTypeId,
            readerKwargs: JSON.stringify(body.readerKwargs),
            extraMetadata: body?.extraMetadata as any,
            status: kgOwner ? 'pending' : ASSET_APPROVAL_PENDING,
            Logs: {
              create: {
                content: kgOwner
                  ? `Asset approved by ${user.email}`
                  : 'Asset approval pending',
              },
            },
          },
        })

        // If owner is uploading asset, enqueue ingestion job
        if (kgOwner) {
          await enqueueIngestionJob({
            asset_id: newA.id,
            asset_type: assetType.key,
            collection_name: kgId,
            user: user.email as string,
            reader_kwargs: body.readerKwargs,
            extra_metadata: body?.extraMetadata,
          })
        }

        return newA
      })

      return res.status(201).json({
        success: true,
        data: processTags(newAsset),
      })
    }

    // ***************** METHOD NOT FOUND **************** //
    default: {
      return res.status(405).json({
        success: true,
        error: 'Method not allowed',
      })
    }
  }
}

export default handler
