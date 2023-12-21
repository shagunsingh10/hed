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
  start: number = 0,
  end: number = 10
) => {
  const res = await fetcher.get(
    `/api/projects/${projectId}/assets?start=${start}&end=${end}`
  )
  const resData = await res.json()
  if (!resData.success) {
    throw Error(resData.error)
  }
  return resData.data
}

export const createAssetApi = async (
  projectId: string,
  data: CreateAssetData
) => {
  const res = await fetcher.post<CreateAssetData>(
    `/api/projects/${projectId}/assets`,
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

export const deleteAssetApi = async (projectId: string, assetId: string) => {
  await fetcher.delete(`/api/projects/${projectId}/assets/${assetId}`)
}

export const getAssetLogsApi = async (projectId: string, assetId: string) => {
  const res = await fetcher.get(
    `/api/projects/${projectId}/assets/${assetId}/logs`
  )
  const resData = await res.json()
  if (!resData.success) {
    throw Error(resData.error)
  }
  return resData.data
}

export const getAssetDocsApi = async (projectId: string, assetId: string) => {
  const res = await fetcher.get(
    `/api/projects/${projectId}/assets/${assetId}/docs`
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
  assetId: string,
  status: string
) => {
  const res = await fetcher.post(
    `/api/projects/${projectId}/assets/${assetId}/approve`,
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

export const getAssetMemebersApi = async (
  projectId: string,
  assetId: string
) => {
  const res = await fetcher.get(
    `/api/projects/${projectId}/assets/${assetId}/members`
  )
  const resData = await res.json()
  if (!resData.success) {
    throw Error(resData.error)
  }
  return resData.data
}

export const addMemberToAssetApi = async (
  projectId: string,
  assetId: string,
  userId: string,
  role: string
) => {
  const res = await fetcher.post(
    `/api/projects/${projectId}/assets/${assetId}/members`,
    {
      userId: userId,
      role: role,
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

export const removeMemberFromAssetApi = async (
  projectId: string,
  assetId: string,
  userId: number
) => {
  const res = await fetcher.delete(
    `/api/projects/${projectId}/assets/${assetId}/members`,
    {
      userId: userId,
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
