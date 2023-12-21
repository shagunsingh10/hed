import { getAssetLogsApi } from '@/apis/assets'
import { globalDateFormatParser } from '@/lib/utils/functions'
import { AssetLog } from '@/types/assets'
import {
  ActionIcon,
  Group,
  List,
  Loader,
  Modal,
  rem,
  Text,
  ThemeIcon,
} from '@mantine/core'
import { showNotification } from '@mantine/notifications'
import {
  IconBellFilled,
  IconCircleCheck,
  IconCircleX,
  IconExclamationCircle,
  IconReload,
} from '@tabler/icons-react'
import React, { FC, useEffect, useState } from 'react'

const iconMap: any = {
  INFO: (
    <ThemeIcon color="blue" size={24} radius="xl">
      <IconBellFilled style={{ width: rem(16), height: rem(16) }} />
    </ThemeIcon>
  ),
  SUCCESS: (
    <ThemeIcon color="teal" size={24} radius="xl">
      <IconCircleCheck style={{ width: rem(16), height: rem(16) }} />
    </ThemeIcon>
  ),
  ERROR: (
    <ThemeIcon color="red" size={24} radius="xl">
      <IconCircleX style={{ width: rem(16), height: rem(16) }} />
    </ThemeIcon>
  ),
  WARNING: (
    <ThemeIcon color="yellow" size={24} radius="xl">
      <IconExclamationCircle style={{ width: rem(16), height: rem(16) }} />
    </ThemeIcon>
  ),
}
type LogsModalProps = {
  open: boolean
  onClose: () => void
  projectId: string
  assetId: string
}

const LogModal: FC<LogsModalProps> = ({
  open,
  onClose,
  projectId,
  assetId,
}) => {
  const [logs, setLogs] = useState<any>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchLogs()
    }
  }, [open])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const logs = await getAssetLogsApi(projectId, assetId)
      setLogs(logs)
    } catch {
      showNotification({
        color: 'red',
        message: 'Failed to fetch logs. Please try again later.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      size="lg"
      opened={open}
      onClose={onClose}
      title={
        <Group gap="xs" align="center">
          <Text size="lg">Asset Logs</Text>
          <ActionIcon onClick={fetchLogs} variant="transparent">
            <IconReload size={20} />{' '}
          </ActionIcon>
        </Group>
      }
    >
      {loading ? (
        <Loader />
      ) : (
        <List spacing="lg" size="sm" center>
          {logs.map((log: AssetLog) => (
            <List.Item icon={iconMap[log.type]}>
              <Group gap="xs">
                <Text size="xs">({globalDateFormatParser(log.timestamp)})</Text>
                <Text size="sm">{log.content}</Text>
              </Group>
            </List.Item>
          ))}
        </List>
      )}
    </Modal>
  )
}

export default LogModal
