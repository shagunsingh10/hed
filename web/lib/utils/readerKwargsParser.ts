export type AssetIngestionInput = {
  assetId: string
  assetType: string
  knowledgeGroupId: string
  projectId: string
  kwargs?: Record<string, unknown>
}

const getIngestionPayload = (data: AssetIngestionInput) => {
  const payload = {
    collection_name: data.knowledgeGroupId,
    asset_id: data.assetId,
    asset_type: data.assetType,
    reader_kwargs: data.kwargs || {},
  }

  if (data.assetType == 'directory') {
    payload.reader_kwargs = {
      directory: `${data.projectId}/${data.knowledgeGroupId}/${data.kwargs?.uploadId}`,
    }
  }

  return payload
}

export default getIngestionPayload
