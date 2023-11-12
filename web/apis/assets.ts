import fetcher from "@/lib/fetcher";
import { CreateAssetData } from "@/types/assets";

export const getAssetTypesApi = async () => {
  const res = await fetcher.get(`/api/asset-types`);
  const resData = await res.json();
  return resData.data;
};

export const getAssetsApi = async (projectId: string, kgId: string) => {
  const res = await fetcher.get(
    `/api/projects/${projectId}/kgs/${kgId}/assets`
  );
  const resData = await res.json();
  return resData.data;
};

export const createAssetApi = async (
  projectId: string,
  kgId: string,
  data: CreateAssetData
) => {
  const res = await fetcher.post<CreateAssetData>(
    `/api/projects/${projectId}/kgs/${kgId}/assets`,
    data,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  const resData = await res.json();
  return resData.data;
};

export const removeUploadApi = async (uploadId: string) => {
  await fetcher.delete(`/api/upload/${uploadId}`);
};

export const uploadFileApi = async (
  projectId: string,
  kgId: string,
  file: File
) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetcher.post(
    `/api/projects/${projectId}/kgs/${kgId}/assets/upload`,
    {},
    {
      body: formData,
    }
  );
  const resData = await res.json();
  return resData.data;
};
