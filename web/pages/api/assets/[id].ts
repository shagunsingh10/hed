import { prisma } from '@/lib/prisma'
import { sendMessageToPythonService } from '@/lib/redis'
import { ApiRes } from '@/types/api'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<string>>
) {
  if (req.method === 'DELETE') {
    try {
      const assetId = req.query.id as string

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

      sendMessageToPythonService(
        JSON.stringify({
          job_type: 'asset-deletion',
          payload: {
            doc_ids: asset?.docs.map((e) => e.vector_db_doc_id),
            asset_id: assetId,
            collection_name: asset?.KnowledgeGroup.id,
          },
        })
      )

      res.status(200).json({ success: true, data: 'Asset deletion initiated' })
    } catch (error) {
      console.error('Error deleting file:', error)
      res.status(500).json({ success: false, error: 'Internal Server Error' })
    }
  } else {
    // Method not allowed
    res.status(405).json({ success: false, error: 'Method Not Allowed' })
  }
}
