import UserAvatar from '@/components/Avatar'
import CustomTable from '@/components/Table'
import { globalDateFormatParser } from '@/lib/functions'
import { Project } from '@/types/projects'
import { CalendarOutlined, UserOutlined } from '@ant-design/icons'
import { Avatar, Tag, Tooltip } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useRouter } from 'next/navigation'
import { FC, useMemo } from 'react'
import styles from './projectlist.module.scss'

type ProjectListProps = {
  projects: Project[]
  loading: boolean
}

const ProjectList: FC<ProjectListProps> = ({ projects, loading }) => {
  const { push } = useRouter()

  const handleProjectClick = (id: string) => {
    push(`/projects/${id}`, {
      scroll: false,
    })
  }

  const columns: ColumnsType<Project> = useMemo(
    () => [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        width: '20%',
        render: (_, record) => (
          <span className={styles.projectTitle}>
            <img src="/icons/project.svg" width={20} height={20} />
            {record.name}
          </span>
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
                <Tag color={'warning'} key={tag}>
                  {tag}
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
          <Avatar.Group className={styles.projectMembers} maxCount={4}>
            {record.members?.map((e) => (
              <Tooltip title={`${e.name}`}>
                <UserAvatar userId={e.id} />
              </Tooltip>
            ))}
          </Avatar.Group>
        ),
      },
    ],
    []
  )

  return (
    <div className={styles.projectListContainer}>
      <CustomTable
        className={styles.assetList}
        rowClassName={styles.tableRow}
        loading={loading}
        onRow={(record) => ({ onClick: () => handleProjectClick(record.id) })}
        columns={columns}
        dataSource={projects}
        pagination={false}
      />
    </div>
  )
}

export default ProjectList
