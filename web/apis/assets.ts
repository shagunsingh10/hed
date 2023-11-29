import fetcher from '@/lib/fetcher'
import { CreateAssetData } from '@/types/assets'

export const getAssetTypesApi = async () => {
  const res = await fetcher.get(`/api/asset-types`)
  const resData = await res.json()
  if (!resData.success) {
    throw Error(resData.error)
  }
  return resData.data
}

export const getAssetsApi = async (projectId: string, kgId: string) => {
  const res = await fetcher.get(
    `/api/assets?projectId=${projectId}&kgId=${kgId}`
  )
  const resData = await res.json()
  if (!resData.success) {
    throw Error(resData.error)
  }
  return resData.data
}

export const createAssetApi = async (
  projectId: string,
  kgId: string,
  data: CreateAssetData
) => {
  const res = await fetcher.post<CreateAssetData>(
    `/api/assets?projectId=${projectId}&kgId=${kgId}`,
    data,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
  const resData = await res.json()
  if (!resData.success) {
    throw Error(resData.error)
  }
  return resData.data
}

export const removeUploadApi = async (assetId: string) => {
  await fetcher.delete(`/api/upload/${assetId}`)
}

export const deleteAssetApi = async (assetId: string) => {
  await fetcher.delete(`/api/assets/${assetId}`)
}

export const uploadFileApi = async (
  projectId: string,
  kgId: string,
  file: File
) => {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetcher.post(
    `/api/assets/upload?projectId=${projectId}&kgId=${kgId}`,
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

export const getAssetLogsApi = async (assetId: string) => {
  const res = await fetcher.get(`/api/assets/${assetId}/logs`)
  const resData = await res.json()
  if (!resData.success) {
    throw Error(resData.error)
  }
  return resData.data
}
