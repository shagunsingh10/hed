import fs from 'fs/promises'
import { config as appConfig } from '@/config'
import type { ApiRes } from '@/types/api'
import { createId } from '@paralleldrive/cuid2'
import formidable from 'formidable'
import { NextApiRequest, NextApiResponse } from 'next'

export const config = {
  api: {
    bodyParser: false,
  },
}

const saveFile = async (file: formidable.File[], directory: string) => {
  const data = await fs.readFile(file[0].filepath)
  await fs.mkdir(directory, { recursive: true })
  await fs.writeFile(`${directory}/${file[0].originalFilename}`, data)
  await fs.unlink(file[0].filepath)
}

export default async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<string>>
) => {
  if (req.method === 'POST') {
    const projectId = req.query.projectId as string
    const kgId = req.query.kgId as string
    const uploadId = createId()

    const filePath = `../.etc/${appConfig.assetUploadPath}/${projectId}/${kgId}/${uploadId}`
    const form = formidable({})
    const parsedForm = await form.parse(req)
    const files = parsedForm[1]
    if (!files.file) {
      return res.status(400).send({
        success: false,
        error: 'No file in request',
      })
    }

    if (files.file && files.file.length > 0)
      await saveFile(files.file, filePath)
    return res.status(201).send({
      success: true,
      data: uploadId,
    })
  }
}
