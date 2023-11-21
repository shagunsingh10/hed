import { PRIMARY_COLOR_DARK } from '@/constants'
import { globalDateFormatParser } from '@/lib/functions'
import useStore from '@/store'
import type { Asset } from '@/types/assets'
import {
  CheckCircleFilled,
  CloseCircleFilled,
  DeleteOutlined,
  ExclamationCircleFilled,
} from '@ant-design/icons'
import { Input, message, Space, Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useEffect, useMemo, useState } from 'react'
import styles from './asset.module.scss'

type KgListProps = {
  projectId: string
  kgId?: string
}

const KgList: React.FC<KgListProps> = ({ projectId, kgId }) => {
  const assets = useStore((state) => state.assets)
  const getAssetTypes = useStore((state) => state.getAssetTypes)
  const loadAssets = useStore((state) => state.loadAssets)

  const [dataSource, setDataSource] = useState<Asset[]>(assets)
  const [value, setValue] = useState('')

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

  const deleteKg = (kgId: string) => {
    message.info('Delete feature coming soon...')
  }

  const deepDiveAsset = () => {
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
        title: 'Knowledge Group',
        align: 'center',
        dataIndex: 'knowledgeGroupName',
        key: 'knowledgeGroupName',
        className: kgId ? 'antd-column-hide' : '',
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
        width: '8%',
        render: (_, { status }) => {
          let color = 'green'
          if (status === 'failed') color = 'red'
          if (status === 'pending') color = 'yellow'
          return (
            <Tag color={color} key={status}>
              {status === 'pending' && <ExclamationCircleFilled />}
              {status === 'success' && <CheckCircleFilled />}
              {status === 'failed' && <CloseCircleFilled />}

              <span style={{ marginLeft: '0.5em' }}>
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
          <Space>
            <DeleteOutlined
              color="primary"
              style={{ cursor: 'pointer' }}
              onClick={() => deleteKg(record.id)}
            />
          </Space>
        ),
      },
    ],
    [deleteKg, FilterByNameInput, kgId]
  )

  useEffect(() => {
    if (loadAssets && getAssetTypes) {
      loadAssets(projectId, kgId)
      getAssetTypes()
    }
  }, [loadAssets, getAssetTypes])

  useEffect(() => setDataSource(assets), [assets])

  return (
    <>
      <Table
        className={styles.kgList}
        columns={columns}
        dataSource={dataSource}
        scroll={{ y: 480 }}
        size="large"
        showSorterTooltip={true}
        sortDirections={['ascend', 'descend']}
        pagination={false}
        sticky={true}
      />
    </>
  )
}

export default KgList
