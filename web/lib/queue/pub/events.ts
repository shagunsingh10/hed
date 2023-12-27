import { config } from '@/config'
import { addMessageToQueue } from '@/lib/queue/pub'
import { ASSET_DELETION, ASSET_INGESTION, QUERY_REQUEST } from './topics'

type IAssetIngestionPayload = {
  asset_id: string
  asset_type: string
  user: string
  reader_kwargs: Record<string, any>
  extra_metadata?: Record<string, any>
}

type IAssetDeletionPayload = {
  doc_ids: string[]
  asset_id: string
  user: string
}

type IQueryPayload = {
  chat_id: string
  query: string
  user: string
  asset_ids: string[]
}

export const enqueueIngestionJob = async (payload: IAssetIngestionPayload) => {
  await addMessageToQueue(config.ingestionTaskQueue, ASSET_INGESTION, payload)
}

export const enqueueAssetDeletionJob = async (
  payload: IAssetDeletionPayload
) => {
  await addMessageToQueue(config.ingestionTaskQueue, ASSET_DELETION, payload)
}

export const enqueueQueryJob = async (payload: IQueryPayload) => {
  await addMessageToQueue(config.queryTaskQueue, QUERY_REQUEST, payload)
}
