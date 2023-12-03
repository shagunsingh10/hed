import { deleteAssetApi, getAssetsApi, getAssetTypesApi } from '@/apis/assets'
import DeleteConfirmationModal from '@/components/Modals/DeleteWarn'
import {
  ASSET_APPROVAL_PENDING,
  ASSET_DELETE_FAILED,
  ASSET_DELETING,
  ASSET_INGESTING,
  ASSET_INGESTION_FAILED,
  ASSET_INGESTION_PENDING,
  ASSET_INGESTION_SUCCESS,
  PRIMARY_COLOR_DARK,
} from '@/constants'
import { useDebouncedCallback } from '@/hooks/useDebounceCallback'
import { globalDateFormatParser } from '@/lib/functions'
import useStore from '@/store'
import type { Asset } from '@/types/assets'
import {
  CheckCircleFilled,
  CloseCircleFilled,
  DeleteFilled,
  ExclamationCircleFilled,
  EyeFilled,
  FileTextFilled,
  ScissorOutlined,
  SearchOutlined,
  SettingFilled,
} from '@ant-design/icons'
import { Input, message, Space, Table, Tag, Tooltip } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useEffect, useMemo, useState } from 'react'
import styles from './asset.module.scss'
import LogModal from './logModal'

type AssetListProps = {
  projectId: string
  kgId: string
}

const AssetList: React.FC<AssetListProps> = ({ projectId, kgId }) => {
  const assets = useStore((state) => state.assets)
  const setAssetTypes = useStore((state) => state.setAssetTypes)
  const setAssets = useStore((state) => state.setAssets)

  const [dataSource, setDataSource] = useState<Asset[]>(assets)
  const [loading, setLoading] = useState(false)
  const [deleteWarnOpen, setDeleteWarn] = useState(false)
  const [assetIdToDelete, setAssetIdToDelete] = useState('')
  const [logModalOpen, setLogModalOpen] = useState(false)
  const [assetIdLogModal, setAssetIdLogModal] = useState('')

  const openDeleteWarning = (assetId: string) => {
    setAssetIdToDelete(assetId)
    setDeleteWarn(true)
  }

  const onChange = useDebouncedCallback((text: string) => {
    setDataSource(
      assets.filter(
        (e) =>
          e.name.toLocaleLowerCase().includes(text.toLocaleLowerCase()) ||
          e?.tags
            ?.toString()
            ?.toLocaleLowerCase()
            ?.includes(text.toLocaleLowerCase()) ||
          e.description
            ?.toLocaleLowerCase()
            .includes(text.toLocaleLowerCase()) ||
          e.createdBy
            ?.toLocaleLowerCase()
            ?.includes(text.toLocaleLowerCase()) ||
          e.status?.toLocaleLowerCase()?.includes(text.toLocaleLowerCase())
      )
    )
  }, 100)

  const openLogModal = (assetId: string) => {
    setAssetIdLogModal(assetId)
    setLogModalOpen(true)
  }

  const deleteAsset = (kgId: string) => {
    setLoading(true)
    deleteAssetApi(kgId)
      .catch((e: Error) => {
        message.error(e.message.toString())
      })
      .finally(() => {
        setLoading(false)
        setDeleteWarn(false)
      })
  }

  const deepDiveAsset: any = () => {
    message.info('Deep dive inside an asset coming soon...')
  }

  const columns: ColumnsType<Asset> = useMemo(
    () => [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        width: '20%',
        render: (_, record) => (
          <b
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3em',
            }}
            onClick={() => deepDiveAsset(record.id)}
          >
            <img src="/icons/asset.svg" width={20} height={20} />
            {record.name}
          </b>
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
        render: (_, record) => (
          <Space>{globalDateFormatParser(new Date(record.createdAt))}</Space>
        ),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        align: 'center',
        render: (_, { status }) => {
          let color = 'warning'
          if (status === ASSET_INGESTION_FAILED) color = 'error'
          if (status === ASSET_INGESTION_SUCCESS) color = 'success'
          if (status === ASSET_INGESTING) color = 'processing'
          if (status === ASSET_DELETING) color = 'orange'
          if (status === ASSET_DELETE_FAILED) color = 'error'
          return (
            <Tag color={color} key={status} bordered>
              {status === ASSET_INGESTION_PENDING && (
                <ExclamationCircleFilled />
              )}
              {status === ASSET_INGESTION_SUCCESS && <CheckCircleFilled />}
              {status === ASSET_INGESTION_FAILED && <CloseCircleFilled />}
              {status === ASSET_INGESTING && <SettingFilled spin />}
              {status === ASSET_DELETING && <ScissorOutlined rotate={-20} />}
              {status === ASSET_DELETE_FAILED && <ExclamationCircleFilled />}
              {status === ASSET_APPROVAL_PENDING && <EyeFilled />}

              <span style={{ marginLeft: '0.5em', fontSize: '0.9em' }}>
                {status.toUpperCase()}
              </span>
            </Tag>
          )
        },
      },
      {
        title: 'Action',
        key: 'action',
        align: 'center',
        width: '10%',
        render: (_, record) => (
          <>
            {['delete-failed', 'success'].includes(record.status) && (
              <Space>
                <Tooltip title={'Delete Asset'}>
                  <DeleteFilled
                    color="primary"
                    style={{ cursor: 'pointer' }}
                    onClick={() => openDeleteWarning(record.id)}
                  />
                </Tooltip>
              </Space>
            )}
            <Space style={{ marginLeft: '1em' }}>
              <Tooltip title={'View logs'}>
                <FileTextFilled
                  color="primary"
                  style={{ cursor: 'pointer' }}
                  onClick={() => openLogModal(record.id)}
                />
              </Tooltip>
            </Space>
          </>
        ),
      },
    ],
    [openDeleteWarning, openLogModal, kgId]
  )

  useEffect(() => {
    setLoading(true)
    getAssetsApi(projectId, kgId)
      .then((assets) => setAssets(assets))
      .catch((e: Error) => message.error(e.message.toString()))
      .finally(() => setLoading(false))
    getAssetTypesApi()
      .then((assetTypes) => setAssetTypes(assetTypes))
      .catch((e: Error) => message.error(e.message.toString()))
  }, [])

  useEffect(() => setDataSource(assets), [assets])

  return (
    <>
      <DeleteConfirmationModal
        open={deleteWarnOpen}
        onCancel={() => setDeleteWarn(false)}
        onDelete={() => deleteAsset(assetIdToDelete)}
        message="Are you sure you want to delete the asset? It is non reversible."
      />
      <LogModal
        open={logModalOpen}
        onClose={() => setLogModalOpen(false)}
        assetId={assetIdLogModal}
      />
      <Input
        prefix={<SearchOutlined />}
        className={styles.search}
        placeholder="Search assets by name, tags, description, status or creator"
        onChange={(e) => onChange(e.target.value)}
      />
      <Table
        loading={loading}
        className={styles.assetList}
        columns={columns}
        dataSource={dataSource}
        pagination={false}
      />
    </>
  )
}

export default AssetList
