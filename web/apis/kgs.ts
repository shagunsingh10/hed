import fetcher from '@/lib/fetcher'
import { CreateKgData } from '@/types/kgs'

export const getKgsApi = async (projectId: string) => {
  const res = await fetcher.get(`/api/projects/${projectId}/kgs`)
  const resData = await res.json()
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
  return resData.data
}

export const getKgByIdApi = async (projectId: string, kgId: string) => {
  const res = await fetcher.get(`/api/projects/${projectId}/kgs/${kgId}`)
  const resData = await res.json()
  return resData.data
}
