import Tooltip from '@/components/Tooltip'
import {
  ASSET_APPROVAL_PENDING,
  ASSET_DELETE_FAILED,
  ASSET_DELETING,
  ASSET_INGESTING,
  ASSET_INGESTION_FAILED,
  ASSET_INGESTION_IN_QUEUE,
  ASSET_INGESTION_SUCCESS,
  ASSET_REJECTED,
  ERROR_COLOR,
  INFO_COLOR,
  SUCCESS_COLOR,
  WARNING_COLOR,
} from '@/constants'
import { ActionIcon } from '@mantine/core'
import {
  IconChecklist,
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconClockPause,
  IconEraserOff,
} from '@tabler/icons-react'

const Status = ({ status }: { status: string }) => {
  let color = WARNING_COLOR
  if (status === ASSET_INGESTION_FAILED) color = ERROR_COLOR
  if (status === ASSET_INGESTION_SUCCESS) color = SUCCESS_COLOR
  if (status === ASSET_INGESTING) color = INFO_COLOR
  if (status === ASSET_DELETING) color = 'orange'
  if (status === ASSET_DELETE_FAILED) color = ERROR_COLOR
  if (status === ASSET_REJECTED) color = ERROR_COLOR

  return (
    <ActionIcon variant="transparent" color={color}>
      <Tooltip text={status}>
        {status === ASSET_INGESTION_IN_QUEUE && <IconClockPause size={20} />}
        {status === ASSET_INGESTION_SUCCESS && (
          <IconCircleCheckFilled size={20} />
        )}
        {status === ASSET_INGESTION_FAILED && <IconCircleXFilled size={20} />}
        {status === ASSET_REJECTED && <IconCircleXFilled size={20} />}
        {status === ASSET_INGESTING && (
          <img src="/icons/ingesting.svg" height={24} width={24} />
        )}
        {status === ASSET_DELETING && <IconEraserOff size={20} />}
        {status === ASSET_DELETE_FAILED && <IconCircleXFilled size={20} />}
        {status === ASSET_APPROVAL_PENDING && <IconChecklist size={20} />}
      </Tooltip>
    </ActionIcon>
  )
}

export default Status
