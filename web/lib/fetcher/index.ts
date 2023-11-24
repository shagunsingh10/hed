const redirectToNotFound = () => {
  if (window) window.location.href = '/404'
}

const fetchApi = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const response = await fetch(url, options)

  if (response.status === 404) {
    redirectToNotFound()
    return response
  }

  return response
}

const fetcher = {
  get: async (url: string, options?: RequestInit): Promise<Response> => {
    return fetchApi(url, options)
  },

  post: async <T>(
    url: string,
    data?: T,
    options?: RequestInit
  ): Promise<Response> => {
    return fetchApi(url, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    })
  },

  put: async <T>(
    url: string,
    data?: T,
    options?: RequestInit
  ): Promise<Response> => {
    return fetchApi(url, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    })
  },

  patch: async <T>(
    url: string,
    data?: T,
    options?: RequestInit
  ): Promise<Response> => {
    return fetchApi(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options,
    })
  },

  delete: async <T>(
    url: string,
    data?: T,
    options?: RequestInit
  ): Promise<Response> => {
    return fetchApi(url, {
      method: 'DELETE',
      body: JSON.stringify(data),
      ...options,
    })
  },
}

export default fetcher
