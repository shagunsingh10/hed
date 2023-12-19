import fetcher from '@/lib/utils/fetcher'

export const getAllUsersApi = async () => {
  const res = await fetcher.get(`/api/users`)
  const resData = await res.json()
  if (!resData.success) {
    throw Error(resData.error)
  }
  return resData.data
}

export const getUserByEmailApi = async (email: string) => {
  const res = await fetcher.get(`/api/users/${email}`)
  const resData = await res.json()
  if (!resData.success) {
    throw Error(resData.error)
  }
  return resData.data
}

export const getUserAvatarApi = async (id: number) => {
  const res = await fetcher.get(`/api/users/image?id=${id}`)
  const resData = await res.json()
  if (!resData.success) {
    throw Error(resData.error)
  }
  return resData.data
}
