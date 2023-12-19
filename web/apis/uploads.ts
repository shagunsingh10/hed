import fetcher from '@/lib/utils/fetcher'
import { FileWithPath } from '@mantine/dropzone'

export const uploadFileApi = async (kgId: string, files: FileWithPath[]) => {
  const formData = new FormData()
  files.forEach((file, index) => {
    formData.append(`file${index}`, file)
  })
  const res = await fetcher.post(
    `/api/uploads?kgId=${kgId}`,
    {},
    {
      body: formData,
    }
  )
  const resData = await res.json()
  if (!resData.success) {
    throw Error(resData.error)
  }
  return resData.data
}

export const removeUploadApi = async (assetId: string) => {
  await fetcher.delete(`/api/uploads/${assetId}`)
}
