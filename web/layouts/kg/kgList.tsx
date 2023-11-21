import CustomTable from '@/components/Table'
import { globalDateFormatParser } from '@/lib/functions'
import useStore from '@/store'
import type { Kg } from '@/types/kgs'
import { DeleteOutlined } from '@ant-design/icons'
import { Input, message, Space, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import styles from './kg.module.scss'

type KgListProps = {
  projectId: string
}

const KgList: React.FC<KgListProps> = ({ projectId }) => {
  const kgs = useStore((state) => state.kgs)
  const getKgs = useStore((state) => state.getKgs)

  const [dataSource, setDataSource] = useState(kgs)
  const [value, setValue] = useState('')

  const FilterByNameInput = (
    <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
      Name
      <Input
        placeholder="Search Knowledge Group"
        value={value}
        onChange={(e) => {
          const currValue = e.target.value
          setValue(currValue)
          const filteredData = kgs.filter((entry) =>
            entry.name.includes(currValue)
          )
          setDataSource(filteredData)
        }}
      />
    </Space>
  )

  const deleteKg = (kgId: string) => {
    console.log(kgId)
    message.info('Delete feature coming soon...')
  }

  const columns: ColumnsType<Kg> = useMemo(
    () => [
      {
        title: FilterByNameInput,
        dataIndex: 'name',
        key: 'name',
        render: (_, record) => (
          <Link
            href={`/projects/${projectId}/kgs/${record.id}`}
            style={{ fontWeight: 'bold' }}
          >
            {record.name}
          </Link>
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
    [deleteKg, FilterByNameInput]
  )

  useEffect(() => {
    if (getKgs) getKgs(projectId)
  }, [getKgs])

  useEffect(() => setDataSource(kgs), [kgs])

  return (
    <CustomTable
      className={styles.kgList}
      columns={columns}
      dataSource={dataSource}
      pagination={false}
    />
  )
}

export default KgList
