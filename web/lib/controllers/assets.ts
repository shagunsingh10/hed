import {
  ASSET_APPROVAL_PENDING,
  ASSET_APPROVED,
  ASSET_INGESTION_IN_QUEUE,
  ASSET_OWNER,
} from '@/constants'
import { prisma } from '@/lib/prisma'
import type { ApiRes } from '@/types/api'
import type {
  Asset,
  AssetLog,
  AssetType,
  CreateAssetData,
} from '@/types/assets'
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

export const getPaginatedAssetsInProject = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<IAssetResponse>>
) => {
  const projectId = req.query.projectId as string
  const start = Number(req.query.start)
  const end = Number(req.query.end)
  const sessionToken = req.headers.sessiontoken as string
  const user = await getUserInfoFromSessionToken(sessionToken)

  const [assets, count] = await prisma.$transaction([
    prisma.asset.findMany({
      where: {
        projectId: projectId,
        isActive: true,
        members: {
          some: {
            userId: user?.id,
          },
        },
      },
      select: {
        id: true,
        name: true,
        tags: true,
        createdAt: true,
        createdBy: true,
        status: true,
        assetTypeId: true,
        assetType: true,
      },
      skip: start,
      take: end,
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.asset.count({
      where: {
        projectId: projectId,
        isActive: true,
        members: {
          some: {
            userId: user?.id,
          },
        },
      },
    }),
  ])

  return res.status(200).json({
    success: true,
    data: { assets: assets, totalAssets: count },
  })
}

export const raiseAssetCreationRequest = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<Asset>>
) => {
  const projectId = req.query.projectId as string
  const body: CreateAssetData = req.body
  const sessionToken = req.headers.sessiontoken as string
  const user = await getUserInfoFromSessionToken(sessionToken)

  const newAsset = await prisma.asset.create({
    data: {
      name: body.name,
      projectId: projectId,
      description: body.description,
      tags: body.tags,
      createdBy: user?.email as string,
      ownerUserId: user?.id as number,
      assetTypeId: body.assetTypeId,
      readerKwargs: JSON.stringify(body.readerKwargs),
      extraMetadata: body?.extraMetadata as any,
      status: ASSET_INGESTION_IN_QUEUE,
      logs: {
        createMany: {
          data: [{ content: `Asset creation request added by ${user?.email}` }],
        },
      },
      members: {
        create: {
          userId: Number(user?.id),
          role: ASSET_OWNER,
        },
      },
    },
    include: {
      assetType: true,
    },
  })

  enqueueIngestionJob({
    asset_id: newAsset.id,
    asset_type: newAsset.assetType.key,
    user: newAsset.createdBy as string,
    reader_kwargs: body.readerKwargs,
    extra_metadata: body?.extraMetadata as any,
  })

  return res.status(201).json({
    success: true,
    data: newAsset,
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
      assetType: true,
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
          type: 'SUCCESS',
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
        asset_type: asset.assetType.key,
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
    },
  })

  enqueueAssetDeletionJob({
    doc_ids: asset?.docs.map((e) => e.doc_id) as string[],
    asset_id: assetId,
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
    data: assetLogs.map((e) => ({ ...e, timestamp: e.timestamp })),
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
      members: {
        some: {
          AND: [{ userId: user?.id }, { role: ASSET_OWNER }],
        },
      },
      isActive: true,
      status: ASSET_APPROVAL_PENDING,
    },
    include: {
      assetType: true,
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
      members: {
        some: {
          AND: [{ userId: user?.id }, { role: ASSET_OWNER }],
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

export const getAssetMembers = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const assetId = req.query.assetId as string

  const assetMembers = await prisma.assetMemberRole.findMany({
    where: {
      assetId: assetId,
    },
    include: {
      member: true,
    },
  })

  res.status(200).json({
    success: true,
    data: assetMembers.map((e) => ({ ...e.member, role: e.role })),
  })
}

export const addMemberToAsset = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<boolean>>
) => {
  const userId = Number(req.body.userId)
  const role = req.body.role as string
  const assetId = req.query.assetId as string

  await prisma.assetMemberRole.create({
    data: {
      assetId: assetId,
      userId: userId,
      role: role,
    },
  })

  res.status(201).json({
    success: true,
    data: true,
  })
}

export const removeMemberFromAsset = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<boolean>>
) => {
  const userId = Number(req.body.userId)
  const assetId = req.query.assetId as string

  await prisma.assetMemberRole.delete({
    where: {
      assetMemberIndex: {
        userId: userId,
        assetId: assetId,
      },
    },
  })

  res.status(201).json({
    success: true,
    data: true,
  })
}
