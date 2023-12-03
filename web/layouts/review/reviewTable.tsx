import { approveAssetApi, getAssetsToReviewApi } from '@/apis/assets'
import { ASSET_INGESTION_PENDING, PRIMARY_COLOR_DARK } from '@/constants'
import { useDebouncedCallback } from '@/hooks/useDebounceCallback'
import { globalDateFormatParser } from '@/lib/functions'
import useStore from '@/store'
import type { Asset } from '@/types/assets'
import { Input, message, Space, Table, Tag, Tooltip } from 'antd'
import { useCallback, useEffect, useMemo, useState } from 'react'
import '@/constants'
import { CheckCircleFilled, SearchOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import styles from './review.module.scss'

const AssetReviewList = () => {
  const assetsToReview = useStore((state) => state.assetsToReview)
  const setAssetsToReview = useStore((state) => state.setAssetsToReview)

  const [dataSource, setDataSource] = useState<Asset[]>(assetsToReview)
  const [loading, setLoading] = useState(false)

  const approveAsset = useCallback(
    async (id: string) => {
      setLoading(true)
      try {
        await approveAssetApi(id, ASSET_INGESTION_PENDING)
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
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3em' }}>
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
                <Tag color={PRIMARY_COLOR_DARK} key={tag}>
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
                <CheckCircleFilled
                  style={{ cursor: 'pointer', color: '#00DD00' }}
                  onClick={() => approveAsset(record.id)}
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
      <Table
        loading={loading}
        columns={columns}
        dataSource={dataSource}
        pagination={false}
      />
    </div>
  )
}

export default AssetReviewList
