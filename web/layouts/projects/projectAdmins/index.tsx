import { getProjectAdminsByIdApi } from '@/apis/projects'
import UserAvatar from '@/components/Avatar'
import CustomTable from '@/components/Table'
import useStore from '@/store'
import { User } from '@/types/users'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { message, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useEffect, useState } from 'react'
import styles from './admin.module.scss'

const columns: ColumnsType<User> = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (_, record) => (
      <span className={styles.memberTitle}>
        <UserAvatar userId={record.id} />
        {record.name}
      </span>
    ),
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    align: 'center',
    width: '50%',
  },
  {
    title: 'Action',
    key: 'action',
    align: 'center',
    width: '10%',
    render: () => (
      <Space size="middle">
        <EditOutlined style={{ cursor: 'pointer' }} />
        <DeleteOutlined style={{ cursor: 'pointer' }} />
      </Space>
    ),
  },
]

type ProjectAdminsProps = {
  projectId: string
}

const ProjectAdmins: React.FC<ProjectAdminsProps> = ({ projectId }) => {
  const [loading, setLoading] = useState(false)
  const admins = useStore((state) => state.selectedProjectAdmins)
  const setAdmins = useStore((state) => state.setSelectedProjectAdmins)

  useEffect(() => {
    setLoading(true)
    getProjectAdminsByIdApi(projectId)
      .then((admns) => {
        setAdmins(admns)
      })
      .catch((e: Error) => {
        message.error(e.message.toString())
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <CustomTable
      className={styles.projectAsminContainer}
      loading={loading}
      columns={columns}
      dataSource={admins}
      pagination={false}
    />
  )
}
export default ProjectAdmins
