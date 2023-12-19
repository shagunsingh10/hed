import fetcher from '@/lib/utils/fetcher'
import { CreateAssetData } from '@/types/assets'

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
    `/api/projects/${projectId}/kgs/${kgId}/assets?start=${start}&end=${end}`
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
    `/api/projects/${projectId}/kgs/${kgId}/assets`,
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

export const deleteAssetApi = async (
  projectId: string,
  kgId: string,
  assetId: string
) => {
  await fetcher.delete(
    `/api/projects/${projectId}/kgs/${kgId}/assets/${assetId}`
  )
}

export const getAssetLogsApi = async (
  projectId: string,
  kgId: string,
  assetId: string
) => {
  const res = await fetcher.get(
    `/api/projects/${projectId}/kgs/${kgId}/assets/${assetId}/logs`
  )
  const resData = await res.json()
  if (!resData.success) {
    throw Error(resData.error)
  }
  return resData.data
}

export const getAssetDocsApi = async (
  projectId: string,
  kgId: string,
  assetId: string
) => {
  const res = await fetcher.get(
    `/api/projects/${projectId}/kgs/${kgId}/assets/${assetId}/docs`
  )
  const resData = await res.json()
  if (!resData.success) {
    throw Error(resData.error)
  }
  return resData.data
}

export const getAssetsToReviewApi = async () => {
  const res = await fetcher.get(`/api/asset-review`)
  const resData = await res.json()
  if (!resData.success) {
    throw Error(resData.error)
  }
  return resData.data
}

export const getAssetsToReviewCountApi = async () => {
  const res = await fetcher.get(`/api/asset-review/count`)
  const resData = await res.json()
  if (!resData.success) {
    throw Error(resData.error)
  }
  return resData.data
}

export const approveAssetApi = async (
  projectId: string,
  kgId: string,
  assetId: string,
  status: string
) => {
  const res = await fetcher.post(
    `/api/projects/${projectId}/kgs/${kgId}/assets/${assetId}/approve`,
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
