export type CreateAssetData = {
  name: string
  description?: string
  tags?: string
  assetTypeId: string
  knowledgeGroupId: string
  readerKwargs: Record<string, any>
  extraMetadata?: Record<string, any>
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
  AssetType?: AssetType
}

export type AssetLog = {
  timestamp: string
  content: string
  type: string
}

export type DocStatus = {
  id: string
  timestamp: Date
  status: string
  error: boolean
  message: string | null
}

export type Doc = {
  name: string
  id: string
  DocStatus: DocStatus[]
}

export interface AssetsSlice {
  assets: Asset[]
  assetTypes: AssetType[]
  totalAssets: number
  setAssetTypes: (assetType: AssetType[]) => void
  setAssets: (assets: Asset[]) => void
  setTotalAssets: (n: number) => void
  addNewAsset: (asset: Asset, hideOne: boolean) => void
  updateAssetStatus: (assetId: string, status: string) => void
  deleteAsset: (assetId: string) => void
}
