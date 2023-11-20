export type CreateAssetData = {
  name: string;
  description?: string;
  tags?: string;
  assetTypeId: string;
  knowledgeGroupId: string;
  readerKwargs?: Record<string, any> | null;
};

export type AssetType = {
  id: string;
  name: string;
  key: string;
};

export type Asset = {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  assetTypeId: string;
  knowledgeGroupId: string;
  status: string;
  ownerUserId: number;
  createdAt: string;
  createdBy?: string;
  knowledgeGroupName?: string;
};

export interface AssetsSlice {
  assets: Asset[];
  assetTypes: AssetType[];
  getAssetTypes: () => void;
  loadAssets: (projectId: string, kgId?: string) => void;
  createAsset: (projectId: string, kgId: string, data: CreateAssetData) => void;
  updateAssetStatus: (assetId: string, status: string) => void;
}
