import {
  ASSET_APPROVAL_PENDING,
  ASSET_APPROVED,
  ASSET_INGESTION_IN_QUEUE,
  KG_OWNER,
} from '@/constants'
import { prisma } from '@/lib/prisma'
import type { ApiRes } from '@/types/api'
import type {
  Asset,
  AssetLog,
  AssetType,
  CreateAssetData,
} from '@/types/assets'
import type { Asset as PrismaAssetRecord } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { getUserInfoFromSessionToken } from '../middlewares/auth'
import {
  enqueueAssetDeletionJob,
  enqueueIngestionJob,
} from '../queue/pub/events'

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

export const getAllAssetTypes = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<AssetType[]>>
) => {
  const assetTypes = await prisma.assetType.findMany({
    select: {
      id: true,
      name: true,
      key: true,
    },
  })
  res.status(200).json({
    success: true,
    data: assetTypes,
  })
}

export const getPaginatedAssetsInKg = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<IAssetResponse>>
) => {
  const kgId = req.query.kgId as string
  const start = Number(req.query.start)
  const end = Number(req.query.end)

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

export const raiseAssetCreationRequest = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<Asset>>
) => {
  const kgId = req.query.kgId as string
  const sessionToken = req.headers.sessiontoken as string
  const body: CreateAssetData = req.body
  const user = await getUserInfoFromSessionToken(sessionToken)

  const newAsset = await prisma.asset.create({
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
      status: ASSET_APPROVAL_PENDING,
      Logs: {
        createMany: {
          data: [
            {
              content: `Asset creation request added by ${user?.email}`,
            },
          ],
        },
      },
    },
  })

  return res.status(201).json({
    success: true,
    data: processTags(newAsset),
  })
}

export const approveAssetCreationRequest = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<null>>
) => {
  const assetId = req.query.assetId as string
  const status = req.body.status
  const sessionToken = req.headers.sessiontoken as string
  const user = await getUserInfoFromSessionToken(sessionToken)

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

  await prisma.$transaction(async (tx) => {
    const approved = status === ASSET_APPROVED
    await Promise.all([
      tx.assetLog.create({
        data: {
          assetId: assetId,
          content: `Asset ${
            approved ? 'approved' : 'rejected'
          } by ${user?.email}`,
        },
      }),
      tx.asset.update({
        where: {
          id: assetId,
        },
        data: {
          status: ASSET_INGESTION_IN_QUEUE,
        },
      }),
    ])
    if (approved) {
      enqueueIngestionJob({
        asset_id: asset.id,
        asset_type: asset.AssetType.key,
        collection_name: asset.knowledgeGroupId,
        user: asset.createdBy as string,
        reader_kwargs: JSON.parse(asset.readerKwargs || '{}'),
        extra_metadata: asset?.extraMetadata as any,
      })
    }
  })

  res.status(201).json({
    success: true,
    data: null,
  })
}

export const deleteAssetById = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<string>>
) => {
  const assetId = req.query.assetId as string
  const sessionToken = req.headers.sessiontoken as string

  const user = await getUserInfoFromSessionToken(sessionToken)

  const asset = await prisma.asset.findFirst({
    where: {
      id: assetId,
    },
    select: {
      docs: true,
      KnowledgeGroup: {
        select: {
          id: true,
        },
      },
    },
  })

  enqueueAssetDeletionJob({
    doc_ids: asset?.docs.map((e) => e.doc_id) as string[],
    asset_id: assetId,
    collection_name: asset?.KnowledgeGroup.id as string,
    user: user?.email as string,
  })

  res
    .status(200)
    .json({ success: true, data: 'Asset deletion request inititated' })
}

export const getAssetLogsById = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<AssetLog[]>>
) => {
  const assetId = req.query.assetId as string

  const assetLogs = await prisma.assetLog.findMany({
    where: {
      assetId: assetId,
    },
    orderBy: {
      timestamp: 'desc',
    },
  })

  res.status(200).json({
    success: true,
    data: assetLogs.map((e) => ({ ...e, timestamp: e.timestamp.toString() })),
  })
}

export const getAssetsPendingReview = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<any>>
) => {
  const sessionToken = req.headers.sessiontoken as string
  const user = await getUserInfoFromSessionToken(sessionToken)

  const kgs = await prisma.asset.findMany({
    where: {
      KnowledgeGroup: {
        UserRole: {
          some: {
            AND: [
              { userId: user?.id },
              {
                role: {
                  equals: KG_OWNER,
                },
              },
            ],
          },
        },
      },
      isActive: true,
      status: ASSET_APPROVAL_PENDING,
    },
    include: {
      AssetType: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  res.status(200).json({
    success: true,
    data: kgs,
  })
}

export const getAssetsPendingReviewCount = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<number>>
) => {
  const sessionToken = req.headers.sessiontoken as string
  const user = await getUserInfoFromSessionToken(sessionToken)

  const assetsToReviewCount = await prisma.asset.count({
    where: {
      KnowledgeGroup: {
        UserRole: {
          some: {
            AND: [
              { userId: user?.id },
              {
                role: {
                  equals: KG_OWNER,
                },
              },
            ],
          },
        },
      },
      isActive: true,
      status: ASSET_APPROVAL_PENDING,
    },
  })

  res.status(200).json({
    success: true,
    data: assetsToReviewCount,
  })
}
