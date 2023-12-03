import { Asset } from './assets'

export interface AssetReviewSlice {
  assetsToReview: Asset[]
  setAssetsToReview: (assets: Asset[]) => void
  assetsToReviewCount: number
  setAssetsToReviewCount: (c: number) => void
}
