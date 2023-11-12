import { message } from "antd";

const redirectToNotFound = () => {
  if (window) window.location.href = "/404";
};

const fetchApi = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const response = await fetch(url, options);

  if (response.status === 404) {
    const res = await response.json();
    redirectToNotFound();
  }

  if (response.status === 403) {
    const res = await response.json();
    message.error(res?.error);
  }

  if (!response.ok) {
    throw new Error(`Request failed with status: ${response.status}`);
  }

  return response;
};

const fetcher = {
  get: async (url: string, options?: RequestInit): Promise<any> => {
    return fetchApi(url, options);
  },

  post: async <T>(
    url: string,
    data?: T,
    options?: RequestInit
  ): Promise<Response> => {
    return fetchApi(url, {
      method: "POST",
      body: JSON.stringify(data),
      ...options,
    });
  },

  put: async <T>(
    url: string,
    data?: T,
    options?: RequestInit
  ): Promise<Response> => {
    return fetchApi(url, {
      method: "PUT",
      body: JSON.stringify(data),
      ...options,
    });
  },

  patch: async <T>(
    url: string,
    data?: T,
    options?: RequestInit
  ): Promise<Response> => {
    return fetchApi(url, {
      method: "PATCH",
      body: JSON.stringify(data),
      ...options,
    });
  },

  delete: async <T>(
    url: string,
    data?: T,
    options?: RequestInit
  ): Promise<Response> => {
    return fetchApi(url, {
      method: "DELETE",
      body: JSON.stringify(data),
      ...options,
    });
  },
};

export default fetcher;
