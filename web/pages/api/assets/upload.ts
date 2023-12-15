import fs from 'fs/promises'
import minioClient from '@/lib/minio/client'
import type { ApiRes } from '@/types/api'
import { createId } from '@paralleldrive/cuid2'
import formidable from 'formidable'
import { NextApiRequest, NextApiResponse } from 'next'

export const config = {
  api: {
    bodyParser: false,
  },
}

type UploadApiResponse = {
  bucketName: string
  uploadStatus: Record<string, 'SUCCESS' | 'ERROR'>
}

const getFilesFromFormData = (files: formidable.Files<string>) => {
  const extractedFiles: formidable.File[] = []
  Object.values(files).forEach((file) => {
    if (file) {
      extractedFiles.push(file[0])
    }
  })
  return extractedFiles
}

const uploadFilesToMinio = async (
  files: formidable.File[],
  bucketName: string
) => {
  await minioClient.makeBucket(bucketName)
  const uploadStatus: Record<string, 'SUCCESS' | 'ERROR'> = {}
  const results = await Promise.all(
    files.map((e) => saveFileToMinio(e, bucketName))
  )
  files.forEach((file, i) => {
    uploadStatus[file.originalFilename as string] = results[i]
  })
  return uploadStatus
}

const saveFileToMinio = async (file: formidable.File, bucketName: string) => {
  try {
    const fileName = file.originalFilename as string
    const data = await fs.readFile(file.filepath)
    await minioClient.putObject(bucketName, fileName, data)
    await fs.unlink(file.filepath)
    return 'SUCCESS'
  } catch {
    return 'ERROR'
  }
}

export default async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<UploadApiResponse>>
) => {
  if (req.method === 'POST') {
    const kgId = req.query.kgId as string

    const uniqueId = createId()
    const bucketName = `${kgId}-${uniqueId}`

    const form = formidable({})
    const parsedForm = await form.parse(req)
    const files = parsedForm[1]

    if (!files || Object.values(files).length <= 0) {
      return res.status(400).send({
        success: false,
        error: 'No file in request',
      })
    }

    const uploadStatus = await uploadFilesToMinio(
      getFilesFromFormData(files),
      bucketName
    )

    return res.status(201).send({
      success: true,
      data: {
        bucketName: bucketName,
        uploadStatus: uploadStatus,
      },
    })
  }
}
