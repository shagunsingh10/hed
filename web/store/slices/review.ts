import { AssetReviewSlice } from '@/types/review'
import { StateCreator } from 'zustand'

export const createAssetsReviewSlice: StateCreator<
  AssetReviewSlice,
  [],
  [],
  AssetReviewSlice
> = (set) => ({
  assetsToReview: [],
  setAssetsToReview: (assets) => {
    set({
      assetsToReview: assets,
      assetsToReviewCount: assets.length,
    })
  },
  assetsToReviewCount: 0,
  setAssetsToReviewCount: (c) => {
    set({
      assetsToReviewCount: c,
    })
  },
})
