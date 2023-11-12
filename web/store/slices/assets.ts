import { StateCreator } from "zustand";
import { createAssetApi, getAssetsApi, getAssetTypesApi } from "@/apis/assets";
import { AssetsSlice } from "@/types/assets";

export const createAssetsSlice: StateCreator<
  AssetsSlice,
  [],
  [],
  AssetsSlice
> = (set, get) => ({
  assets: [],
  assetTypes: [],
  getAssetTypes: async () => {
    set({
      assetTypes: await getAssetTypesApi(),
    });
  },
  createAsset: async (projectId, kgId, data) => {
    const newAsset = await createAssetApi(projectId, kgId, data);
    set({
      assets: [...get().assets, newAsset],
    });
  },
  loadAssets: async (projectId, kgId) => {
    set({
      assets: await getAssetsApi(projectId, kgId),
    });
  },
  updateAssetStatus: (assetId, status) => {
    const assets = get().assets;
    const updatedAssets = assets.map((e) => {
      if (e.id === assetId)
        return {
          ...e,
          status: status,
        };
      return e;
    });
    set({
      assets: updatedAssets,
    });
  },
});
