import fetcher from '@/lib/fetcher'
import { CreateKgData } from '@/types/kgs'

export const getKgsApi = async (projectId: string) => {
  const res = await fetcher.get(`/api/projects/${projectId}/kgs`)
  const resData = await res.json()
  if (res.status != 200) return []
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
  if (res.status != 200) return []
  return resData.data
}

export const getKgByIdApi = async (projectId: string, kgId: string) => {
  const res = await fetcher.get(`/api/projects/${projectId}/kgs/${kgId}`)
  const resData = await res.json()
  const members = resData.data?.UserRole?.map((user: any) => ({
    id: user?.User?.id,
    name: user?.User?.name,
    email: user?.User?.email,
    role: user?.role,
  }))
  delete resData.data['UserRole']
  resData.data['members'] = members
  return resData.data
}
