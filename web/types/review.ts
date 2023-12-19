import type { AssetWithProjectId } from './assets'

export interface AssetReviewSlice {
  assetsToReview: AssetWithProjectId[]
  setAssetsToReview: (assets: AssetWithProjectId[]) => void
  assetsToReviewCount: number
  setAssetsToReviewCount: (c: number) => void
}
