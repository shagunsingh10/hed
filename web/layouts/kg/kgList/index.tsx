import { globalDateFormatParser } from '@/lib/functions'
import { Kg } from '@/types/kgs'
import { CalendarOutlined, UserOutlined } from '@ant-design/icons'
import { Avatar, Table, Tag, Tooltip } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useRouter } from 'next/navigation'
import { FC, useMemo } from 'react'
import styles from './kggrid.module.scss'

type KgGridProps = {
  projectId: string
  kgs: Kg[]
  loading: boolean
}

const KGGrid: FC<KgGridProps> = ({ projectId, kgs, loading }) => {
  const { push } = useRouter()

  const handleProjectClick = (id: string) => {
    push(`/projects/${projectId}/kgs/${id}`, {
      scroll: false,
    })
  }

  const columns: ColumnsType<Kg> = useMemo(
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
            onClick={() => handleProjectClick(record.id)}
          >
            <img src="/icons/kg.svg" width={20} height={20} />
            {record.name}
          </b>
        ),
      },
      {
        title: 'Tags',
        dataIndex: 'tags',
        align: 'center',
        key: 'tags',
        width: '20%',
        ellipsis: true,
        render: (_, { tags }) => (
          <div className={styles.tags}>
            {tags?.map((tag) => {
              return (
                <Tag color={'blue'} key={tag}>
                  {tag.toUpperCase()}
                </Tag>
              )
            })}
          </div>
        ),
      },
      {
        title: 'Created By',
        dataIndex: 'createdBy',
        align: 'center',
        key: 'createdBy',
        render: (_, record) => (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3em',
              justifyContent: 'center',
            }}
          >
            <UserOutlined />
            {record.createdBy}
          </span>
        ),
      },
      {
        title: 'Created At',
        dataIndex: 'createdAt',
        align: 'center',
        render: (_, record) => (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3em',
              justifyContent: 'center',
            }}
          >
            <CalendarOutlined />
            {globalDateFormatParser(new Date(record.createdAt))}
          </span>
        ),
      },
      {
        title: 'Members',
        dataIndex: 'createdAt',
        align: 'center',
        render: (_, record) => (
          <Avatar.Group className={styles.kgMembers} maxCount={4}>
            {record.members?.map((e) => (
              <Tooltip title={`${e.name} (${e.role})`}>
                <Avatar
                  size={'small'}
                  src={<img src={e.image} referrerPolicy="no-referrer" />}
                />
              </Tooltip>
            ))}
          </Avatar.Group>
        ),
      },
    ],
    []
  )

  return (
    <div className={styles.kgCardsContainer}>
      <Table
        loading={loading}
        className={styles.assetList}
        columns={columns}
        dataSource={kgs}
        pagination={false}
      />
    </div>
  )
}

export default KGGrid
