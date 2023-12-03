import { approveAssetApi, getAssetsToReviewApi } from '@/apis/assets'
import { ASSET_INGESTION_PENDING, ASSET_REJECTED } from '@/constants'
import { useDebouncedCallback } from '@/hooks/useDebounceCallback'
import { globalDateFormatParser } from '@/lib/functions'
import useStore from '@/store'
import type { Asset } from '@/types/assets'
import { Input, message, Space, Tag, Tooltip } from 'antd'
import { useCallback, useEffect, useMemo, useState } from 'react'
import '@/constants'
import CustomTable from '@/components/Table'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
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
        message.error(e?.message?.toString())
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

  const columns: ColumnsType<Asset> = useMemo(
    () => [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        width: '20%',
        render: (_, { name }) => (
          <span className={styles.assetTitle}>
            <img src="/icons/asset.svg" width={20} height={20} />
            {name}
          </span>
        ),
      },
      {
        title: 'Tags',
        dataIndex: 'tags',
        align: 'center',
        key: 'tags',
        render: (_, { tags }) => (
          <>
            {tags?.map((tag) => {
              return (
                <Tag color={'blue'} key={tag}>
                  {tag.toUpperCase()}
                </Tag>
              )
            })}
          </>
        ),
      },
      {
        title: 'Created By',
        dataIndex: 'createdBy',
        align: 'center',
        key: 'createdBy',
      },
      {
        title: 'Created At',
        dataIndex: 'createdAt',
        align: 'center',
        sorter: true,
        render: (_, record) => (
          <Space>{globalDateFormatParser(new Date(record.createdAt))}</Space>
        ),
      },
      {
        title: 'Action',
        key: 'action',
        align: 'center',
        width: '10%',
        render: (_, record) => (
          <>
            <Space>
              <Tooltip title={'Approve'}>
                <CheckCircleOutlined
                  style={{ cursor: 'pointer', color: '#00DD00' }}
                  onClick={() =>
                    sendAssetStatus(record.id, ASSET_INGESTION_PENDING)
                  }
                />
              </Tooltip>
              <Tooltip title={'Reject'}>
                <CloseCircleOutlined
                  style={{ cursor: 'pointer', marginLeft: '1em' }}
                  onClick={() => sendAssetStatus(record.id, ASSET_REJECTED)}
                />
              </Tooltip>
            </Space>
          </>
        ),
      },
    ],
    []
  )

  useEffect(() => {
    setLoading(true)
    getAssetsToReviewApi()
      .then((assets) => setAssetsToReview(assets))
      .catch((e: Error) => message.error(e.message.toString()))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => setDataSource(assetsToReview), [assetsToReview])

  return (
    <div style={{ height: '88%' }}>
      <div className={styles.screenHeader}>
        <Input
          prefix={<SearchOutlined />}
          className={styles.search}
          placeholder="Search assets by name, tags, description or creator"
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      <CustomTable
        loading={loading}
        columns={columns}
        dataSource={dataSource}
        pagination={false}
      />
    </div>
  )
}

export default AssetReviewList
