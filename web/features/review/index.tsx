import { approveAssetApi, getAssetsToReviewApi } from '@/apis/assets'
import OverlayLoader from '@/components/Loader'
import { ASSET_INGESTION_PENDING, ASSET_REJECTED } from '@/constants'
import { useDebouncedCallback } from '@/hooks/useDebounceCallback'
import { globalDateFormatParser } from '@/lib/utils/functions'
import useStore from '@/store'
import type { Asset } from '@/types/assets'
import { ActionIcon, Group, Input, Space, Text, Title } from '@mantine/core'
import { showNotification } from '@mantine/notifications'
import {
  IconCircleCheck,
  IconCircleX,
  IconCube,
  IconSearch,
} from '@tabler/icons-react'
import { DataTable } from 'mantine-datatable'
import { useCallback, useEffect, useMemo, useState } from 'react'
import styles from './review.module.scss'

const AssetReviewList = () => {
  const assetsToReview = useStore((state) => state.assetsToReview)
  const setAssetsToReview = useStore((state) => state.setAssetsToReview)

  const [dataSource, setDataSource] = useState<Asset[]>(assetsToReview)
  const [loading, setLoading] = useState(false)

  const sendAssetStatus = useCallback(
    async (id: string, status: string) => {
      setLoading(true)
      try {
        await approveAssetApi(id, status)
      } catch (e: any) {
        showNotification({ message: e?.message?.toString(), color: 'red' })
      } finally {
        setLoading(false)
      }
    },
    [approveAssetApi, setLoading]
  )

  const onChange = useDebouncedCallback((text: string) => {
    setDataSource(
      assetsToReview.filter(
        (e) =>
          e.name.toLocaleLowerCase().includes(text.toLocaleLowerCase()) ||
          e?.tags
            ?.toString()
            ?.toLocaleLowerCase()
            ?.includes(text.toLocaleLowerCase()) ||
          e.description
            ?.toLocaleLowerCase()
            .includes(text.toLocaleLowerCase()) ||
          e.createdBy?.toLocaleLowerCase()?.includes(text.toLocaleLowerCase())
      )
    )
  }, 100)

  const columns: any = useMemo(
    () => [
      {
        label: 'Name',
        accessor: 'name',
        render: (record: any) => (
          <Group align="center" gap="xs">
            <IconCube size={15} />
            <Text size="xs" fw="500">
              {record.name}
            </Text>
          </Group>
        ),
      },
      {
        label: 'Created By',
        accessor: 'createdBy',
        textAlign: 'center',
      },
      {
        label: 'Created At',
        accessor: 'createdAt',
        textAlign: 'center',
        render: (record: any) => (
          <Space>{globalDateFormatParser(new Date(record.createdAt))}</Space>
        ),
      },
      {
        label: 'Action',
        accessor: 'action',
        textAlign: 'center',
        render: (record: any) => (
          <Group justify="center">
            <ActionIcon
              variant="transparent"
              onClick={() =>
                sendAssetStatus(record.id, ASSET_INGESTION_PENDING)
              }
            >
              <IconCircleCheck size={20} />
            </ActionIcon>
            <ActionIcon
              variant="transparent"
              onClick={() => sendAssetStatus(record.id, ASSET_REJECTED)}
            >
              <IconCircleX size={20} color="red" />
            </ActionIcon>
          </Group>
        ),
      },
    ],
    []
  )

  useEffect(() => {
    setLoading(true)
    getAssetsToReviewApi()
      .then((assets) => setAssetsToReview(assets))
      .catch((e: Error) =>
        showNotification({ message: e.message.toString(), color: 'red' })
      )
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => setDataSource(assetsToReview), [assetsToReview])

  return loading ? (
    <OverlayLoader />
  ) : (
    <div className={styles.reviewContainer}>
      <div className={styles.screenHeader}>
        <Title order={3}>Assets pending review</Title>
      </div>
      <Input
        rightSection={<IconSearch size={15} />}
        className={styles.search}
        placeholder="Search assets by name, tags, description or creator"
        onChange={(e) => onChange(e.target.value)}
      />
      <div className={styles.reviewTable}>
        <DataTable
          classNames={{
            header: styles.headerRow,
          }}
          records={dataSource}
          columns={columns}
          withTableBorder
          borderRadius="sm"
          striped
          highlightOnHover
        />
      </div>
    </div>
  )
}

export default AssetReviewList
