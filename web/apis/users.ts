import fetcher from '@/lib/fetcher'

export const getAllUsers = async () => {
  const res = await fetcher.get(`/api/users`)
  const resData = await res.json()
  if (!resData.success) {
    throw Error(resData.error)
  }
  return resData.data
}

export const getUserByEmail = async (email: string) => {
  const res = await fetcher.get(`/api/users/${email}`)
  const resData = await res.json()
  if (!resData.success) {
    throw Error(resData.error)
  }
  return resData.data
}
