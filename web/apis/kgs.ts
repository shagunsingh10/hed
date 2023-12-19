import fetcher from '@/lib/utils/fetcher'
import { CreateKgData } from '@/types/kgs'

export const getKgsApi = async (projectId: string) => {
  const res = await fetcher.get(`/api/projects/${projectId}/kgs`)
  const resData = await res.json()
  if (!resData.success) {
    throw Error(resData.error)
  }
  return resData.data
}

export const createKgApi = async (projectId: string, data: CreateKgData) => {
  const res = await fetcher.post<CreateKgData>(
    `/api/projects/${projectId}/kgs`,
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

export const getKgByIdApi = async (projectId: string, kgId: string) => {
  const res = await fetcher.get(`/api/projects/${projectId}/kgs/${kgId}`)
  const resData = await res.json()
  if (!resData.success) {
    throw Error(resData.error)
  }
  return resData.data
}

export const addUserToKgApi = async (
  projectId: string,
  kgId: string,
  userId: string,
  role: string
) => {
  const res = await fetcher.post(
    `/api/projects/${projectId}/kgs/${kgId}/users`,
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

export const removeUserFromKgApi = async (
  projectId: string,
  kgId: string,
  userId: number
) => {
  const res = await fetcher.delete(
    `/api/projects/${projectId}/kgs/${kgId}/users`,
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

export const getKgMemebersApi = async (projectId: string, kgId: string) => {
  const res = await fetcher.get(`/api/projects/${projectId}/kgs/${kgId}/users`)
  const resData = await res.json()
  if (!resData.success) {
    throw Error(resData.error)
  }
  return resData.data
}
