import fetcher from '@/lib/fetcher'
import { CreateProjectData } from '@/types/projects'
import { message } from 'antd'

export const getProjectsApi = async () => {
  const res = await fetcher.get('/api/projects')
  const resData = await res.json()
  if (!resData.success) {
    message.error(resData.error)
    return []
  }
  return resData.data
}

export const createProjectApi = async (data: CreateProjectData) => {
  const res = await fetcher.post<CreateProjectData>('/api/projects', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const resData = await res.json()
  if (!resData.success) {
    message.error(resData.error)
    return []
  }
  return resData.data
}

export const getProjectByIdApi = async (projectId: string) => {
  const res = await fetcher.get(`/api/projects/${projectId}`)
  const resData = await res.json()
  if (!resData.success) {
    message.error(resData.error)
    return {}
  }
  return resData.data
}
