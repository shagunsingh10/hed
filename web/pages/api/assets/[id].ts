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

      const doc_ids = await prisma.doc.findMany({
        where: {
          assetId: assetId,
        },
        select: {
          vector_db_doc_id: true,
        },
      })

      sendMessageToPythonService(
        JSON.stringify({
          job_type: 'cleaning',
          payload: {
            doc_ids: doc_ids.map((e) => e.vector_db_doc_id),
          },
        })
      )

      res.status(200).json({ success: true, data: 'File deleted successfully' })
    } catch (error) {
      console.error('Error deleting file:', error)
      res.status(500).json({ success: false, error: 'Internal Server Error' })
    }
  } else {
    // Method not allowed
    res.status(405).json({ success: false, error: 'Method Not Allowed' })
  }
}
