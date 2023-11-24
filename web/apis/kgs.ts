import fetcher from '@/lib/fetcher'
import { CreateKgData } from '@/types/kgs'

export const getKgsApi = async (projectId: string) => {
  const res = await fetcher.get(`/api/kgs?projectId=${projectId}`)
  const resData = await res.json()
  if (!resData.success) {
    throw Error(resData.error)
  }
  return resData.data
}

export const createKgApi = async (projectId: string, data: CreateKgData) => {
  const res = await fetcher.post<CreateKgData>(
    `/api/kgs?projectId=${projectId}`,
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

export const getKgByIdApi = async (kgId: string) => {
  const res = await fetcher.get(`/api/kgs/${kgId}`)
  const resData = await res.json()
  if (!resData.success) {
    throw Error(resData.error)
  }
  return resData.data
}

export const addUserToKgApi = async (
  kgId: string,
  userId: string,
  role: string
) => {
  const res = await fetcher.post(
    `/api/kgs/${kgId}/users`,
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

export const getKgMemebersApi = async (kgId: string) => {
  const res = await fetcher.get(`/api/kgs/${kgId}/users`)
  const resData = await res.json()
  if (!resData.success) {
    throw Error(resData.error)
  }
  return resData.data
}
