import minioClient from '@/lib/minio/client'
import { prisma } from '@/lib/prisma'
import { ApiRes } from '@/types/api'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<string>>
) {
  if (req.method === 'DELETE') {
    try {
      const uploadId = req.query.uploadId as string

      if (!uploadId) {
        return res.status(400).json({
          success: false,
          error: 'Missing upload id in the request query',
        })
      }

      const fileInfo = await prisma.asset.findFirst({
        where: {
          id: uploadId,
        },
        select: {
          knowledgeGroupId: true,
          KnowledgeGroup: {
            select: {
              projectId: true,
            },
          },
        },
      })

      if (!fileInfo) {
        return res.status(400).json({
          success: false,
          error: 'File not found',
        })
      }

      const objectName = `${fileInfo.KnowledgeGroup.projectId}/${fileInfo.knowledgeGroupId}/${uploadId}`

      // Check if the object exists
      const exists = await minioClient
        .statObject('your-bucket-name', objectName)
        .then(
          () => true,
          () => false
        )

      if (!exists) {
        return res.status(404).json({ success: false, error: 'File not found' })
      }

      // Delete the object
      await minioClient.removeObject('your-bucket-name', objectName)

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
