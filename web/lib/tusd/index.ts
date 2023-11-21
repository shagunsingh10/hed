import fetcher from '../fetcher'

export const removeItem = async (tusId: string) => {
  await fetcher.delete(
    `/api/tus-upload/${tusId}`,
    {},
    {
      headers: {
        'Tus-Resumable': '1.0.0',
      },
    }
  )
}
