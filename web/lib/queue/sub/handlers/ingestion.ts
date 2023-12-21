import { prisma } from '@/lib/prisma'

// ******************** Handle Events ******************* //
export const handleDocStatus = async (message: any) => {
  await prisma.doc.upsert({
    create: {
      doc_id: message.doc_id,
      name: message.filename,
      assetId: message.asset_id,
      statusLog: {
        create: {
          status: message.status,
          error: message.error,
          message: message.message,
        },
      },
    },
    update: {
      statusLog: {
        create: {
          status: message.status,
          error: message.error,
          message: message.message,
        },
      },
    },
    where: {
      doc_id: message.doc_id,
    },
  })
}

export const handleAssetStatus = async (message: any) => {
  await prisma.asset.update({
    data: {
      status: message.status,
    },
    where: {
      id: message.asset_id,
    },
  })
}
