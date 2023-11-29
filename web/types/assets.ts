export type CreateAssetData = {
  name: string
  description?: string
  tags?: string
  assetTypeId: string
  knowledgeGroupId: string
  readerKwargs?: Record<string, any> | null
  extraMetadata?: Record<string, any> | null
}

export type AssetType = {
  id: string
  name: string
  key: string
}

export type Asset = {
  id: string
  name: string
  description?: string
  tags?: string[]
  assetTypeId: string
  knowledgeGroupId: string
  status: string
  ownerUserId: number
  createdAt: string
  createdBy?: string
  knowledgeGroupName?: string
}

export type AssetLog = {
  timestamp: string
  content: string
  type: string
}

export type Doc = {
  name: string
  id: string
}

export interface AssetsSlice {
  assets: Asset[]
  assetTypes: AssetType[]
  setAssetTypes: (assetType: AssetType[]) => void
  setAssets: (assets: Asset[]) => void
  addNewAsset: (asset: Asset) => void
  updateAssetStatus: (assetId: string, status: string) => void
  deleteAsset: (assetId: string) => void
}
