import { processMessageFromQueue } from '@/lib/redis/queue'
import { handleAssetStatus, handleDocStatus } from './ingestion'
import { ASSET_INGESTION_STATUS, DOC_STATUS } from './topics'

const topicsHandlers = {
  [DOC_STATUS]: handleDocStatus,
  [ASSET_INGESTION_STATUS]: handleAssetStatus,
}

processMessageFromQueue(topicsHandlers)
