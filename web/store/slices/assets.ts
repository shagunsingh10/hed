import { AssetsSlice } from '@/types/assets'
import { StateCreator } from 'zustand'

export const createAssetsSlice: StateCreator<
  AssetsSlice,
  [],
  [],
  AssetsSlice
> = (set, get) => ({
  assetTypes: [],
  setAssetTypes: async (assetTypes) => {
    set({
      assetTypes: assetTypes,
    })
  },
  assets: [],
  addNewAsset: (newAsset) => {
    set({
      assets: [newAsset, ...get().assets],
    })
  },
  setAssets: (assets) => {
    set({
      assets: assets,
    })
  },
  updateAssetStatus: (assetId, status) => {
    const assets = get().assets
    const updatedAssets = assets.map((e) => {
      if (e.id === assetId)
        return {
          ...e,
          status: status,
        }
      return e
    })
    set({
      assets: updatedAssets,
    })
  },
  deleteAsset: (assetId) => {
    const assets = get().assets
    const updatedAssets = assets.filter((e) => e.id !== assetId)
    set({
      assets: updatedAssets,
    })
  },
})
