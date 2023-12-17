import { addMessageToQueue } from '@/lib/redis/queue'
import { ASSET_INGESTION, QUERY_REQUEST } from './topics'

type IAssetIngestionPayload = {
  asset_id: string
  collection_name: string
  asset_type: string
  user: string
  reader_kwargs: Record<string, any>
  extra_metadata?: Record<string, any>
}

type IQueryPayload = {
  chat_id: string
  query: string
  user: string
  collections: string[]
}

export const enqueueIngestionJob = async (payload: IAssetIngestionPayload) => {
  await addMessageToQueue(ASSET_INGESTION, payload)
}

export const enqueueQueryJob = async (payload: IQueryPayload) => {
  await addMessageToQueue(QUERY_REQUEST, payload)
}
