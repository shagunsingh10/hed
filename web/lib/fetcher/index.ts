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
  get: async (
    url: string,
    params?: Record<string, any>,
    options?: RequestInit
  ): Promise<any> => {
    const queryString = params
      ? `?${new URLSearchParams(params).toString()}`
      : "";
    return fetchApi(`${url}${queryString}`, options);
  },

  post: async <T>(
    url: string,
    data?: T,
    options?: RequestInit
  ): Promise<Response> => {
    return fetchApi(url, {
      ...options,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  },

  put: async <T>(
    url: string,
    data?: T,
    options?: RequestInit
  ): Promise<Response> => {
    return fetchApi(url, {
      ...options,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  },

  patch: async <T>(
    url: string,
    data: T,
    options?: RequestInit
  ): Promise<Response> => {
    return fetchApi(url, {
      ...options,
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  },

  delete: async <T>(
    url: string,
    data: T,
    options?: RequestInit
  ): Promise<Response> => {
    return fetchApi(url, {
      ...options,
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  },
};

export default fetcher;
