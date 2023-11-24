import fetcher from '@/lib/fetcher'

export const getAllUsers = async () => {
  const res = await fetcher.get(`/api/users`)
  const resData = await res.json()
  if (res.status != 200) return []
  return resData.data
}
