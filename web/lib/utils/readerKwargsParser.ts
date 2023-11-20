import { config as appConfig } from "@/config";

export type AssetIngestionInput = {
  assetId: string;
  assetType: string;
  knowledgeGroupId: string;
  projectId: string;
  kwargs?: Record<string, any>;
};

const getIngestionPayload = (data: AssetIngestionInput) => {
  let payload = {
    collection_name: data.knowledgeGroupId,
    asset_id: data.assetId,
    asset_type: data.assetType,
    reader_kwargs: data.kwargs || {},
  };

  if (data.assetType == "directory") {
    payload.reader_kwargs = {
      directory: `${appConfig.assetUploadPath}/${data.projectId}/${data.knowledgeGroupId}/${data.kwargs?.uploadId}`,
    };
  }

  return payload;
};

export default getIngestionPayload;
