export type AssetIngestionInput = {
  assetId: string
  assetType: string
  knowledgeGroupId: string
  projectId: string
  user: string
  kwargs?: Record<string, unknown> | null
  extra_metadata?: Record<string, unknown> | null
}

const getIngestionPayload = (data: AssetIngestionInput) => {
  const payload = {
    collection_name: data.knowledgeGroupId,
    asset_id: data.assetId,
    asset_type: data.assetType,
    user: data.user,
    reader_kwargs: data.kwargs || {},
    extra_metadata: data.extra_metadata || {},
  }

  if (data.assetType == 'directory') {
    payload.reader_kwargs = {
      directory: `${data.projectId}/${data.knowledgeGroupId}/${data.kwargs?.uploadId}`,
    }
  }

  return payload
}

export default getIngestionPayload
