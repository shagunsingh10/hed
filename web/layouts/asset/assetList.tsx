import { deleteAssetApi, getAssetsApi, getAssetTypesApi } from '@/apis/assets'
import DeleteConfirmationModal from '@/components/Modals/DeleteWarn'
import { PRIMARY_COLOR_DARK } from '@/constants'
import { globalDateFormatParser } from '@/lib/functions'
import useStore from '@/store'
import type { Asset } from '@/types/assets'
import {
  CheckCircleFilled,
  CloseCircleFilled,
  DeleteFilled,
  ExclamationCircleFilled,
  FileTextFilled,
  ScissorOutlined,
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
  const [value, setValue] = useState('')
  const [deleteWarnOpen, setDeleteWarn] = useState(false)
  const [assetIdToDelete, setAssetIdToDelete] = useState('')
  const [logModalOpen, setLogModalOpen] = useState(false)
  const [assetIdLogModal, setAssetIdLogModal] = useState('')

  const FilterByNameInput = (
    <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
      Name
      <Input
        placeholder="Search Asset"
        value={value}
        onChange={(e) => {
          const currValue = e.target.value
          setValue(currValue)
          const filteredData = assets.filter((entry) =>
            entry.name.includes(currValue)
          )
          setDataSource(filteredData)
        }}
      />
    </Space>
  )

  const openDeleteWarning = (assetId: string) => {
    setAssetIdToDelete(assetId)
    setDeleteWarn(true)
  }

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
        title: FilterByNameInput,
        dataIndex: 'name',
        key: 'name',
        width: '20%',
        render: (_, record) => (
          <b style={{ cursor: 'pointer' }} onClick={deepDiveAsset}>
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
          let color = 'success'
          if (status === 'failed') color = 'error'
          if (status === 'pending') color = 'warning'
          if (status === 'ingesting') color = 'processing'
          if (status === 'deleting') color = 'orange'
          if (status === 'delete-failed') color = 'error'
          return (
            <Tag color={color} key={status} bordered>
              {status === 'pending' && <ExclamationCircleFilled />}
              {status === 'success' && <CheckCircleFilled />}
              {status === 'failed' && <CloseCircleFilled />}
              {status === 'ingesting' && <SettingFilled spin />}
              {status === 'deleting' && <ScissorOutlined rotate={-20} />}
              {status === 'delete-failed' && <ExclamationCircleFilled />}

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
    [openDeleteWarning, openLogModal, FilterByNameInput, kgId]
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
      <Table
        loading={loading}
        className={styles.assetList}
        columns={columns}
        dataSource={dataSource}
        scroll={{ y: 600 }}
        showSorterTooltip={true}
        sortDirections={['ascend', 'descend']}
        pagination={false}
      />
    </>
  )
}

export default AssetList
