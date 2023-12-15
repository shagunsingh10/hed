import fetcher from '@/lib/utils/fetcher'
import { PostMessage } from '@/types/chats'

export const getChatsApi = async (projectId?: string) => {
  const res = await fetcher.get(
    `/api/chats${projectId ? `?projectId=${projectId}` : ''}`
  )
  const resData = await res.json()
  if (!resData.success) {
    throw Error(resData.error)
  }
  return resData.data
}

export const addNewChatApi = async (title: string, projectId?: string) => {
  const res = await fetcher.post(
    `/api/chats${projectId ? `?projectId=${projectId}` : ''}`,
    {
      title: title,
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

export const loadMessagesApi = async (chatId: string) => {
  const res = await fetcher.get(`/api/chats/${chatId}`)
  const resData = await res.json()
  if (!resData.success) {
    throw Error(resData.error)
  }
  return resData.data
}

export const postQueryApi = async (chatId: string, query: string) => {
  const res = await fetcher.post<PostMessage>(
    `/api/chats/${chatId}`,
    {
      content: query,
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
