import fetcher from '@/lib/utils/fetcher'
import { CreateAssetData } from '@/types/assets'
import { FileWithPath } from '@mantine/dropzone'

export const getAssetTypesApi = async () => {
  const res = await fetcher.get(`/api/asset-types`)
  const resData = await res.json()
  if (!resData.success) {
    throw Error(resData.error)
  }
  return resData.data
}

export const getAssetsApi = async (
  projectId: string,
  kgId: string,
  start: number = 0,
  end: number = 10
) => {
  const res = await fetcher.get(
    `/api/assets?projectId=${projectId}&kgId=${kgId}&start=${start}&end=${end}`
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
  files: FileWithPath[]
) => {
  const formData = new FormData()
  files.forEach((file, index) => {
    formData.append(`file${index}`, file)
  })
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

export const getAssetDocsApi = async (assetId: string) => {
  const res = await fetcher.get(`/api/assets/${assetId}/docs`)
  const resData = await res.json()
  if (!resData.success) {
    throw Error(resData.error)
  }
  return resData.data
}

export const getAssetsToReviewApi = async () => {
  const res = await fetcher.get(`/api/assets/review`)
  const resData = await res.json()
  if (!resData.success) {
    throw Error(resData.error)
  }
  return resData.data
}

export const getAssetsToReviewCountApi = async () => {
  const res = await fetcher.get(`/api/assets/review-count`)
  const resData = await res.json()
  if (!resData.success) {
    throw Error(resData.error)
  }
  return resData.data
}

export const approveAssetApi = async (assetId: string, status: string) => {
  const res = await fetcher.post(
    `/api/assets/${assetId}/approve`,
    {
      status: status,
    },
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
