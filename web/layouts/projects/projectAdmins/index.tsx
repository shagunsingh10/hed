import {
  getProjectAdminsByIdApi,
  removeAdminFromprojectApi,
} from '@/apis/projects'
import UserAvatar from '@/components/Avatar'
import DeleteConfirmationModal from '@/components/Modals/DeleteWarn'
import CustomTable from '@/components/Table'
import useStore from '@/store'
import { User } from '@/types/users'
import { DeleteOutlined } from '@ant-design/icons'
import { message, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useEffect, useMemo, useState } from 'react'
import styles from './admin.module.scss'

type ProjectAdminsProps = {
  projectId: string
}

const ProjectAdmins: React.FC<ProjectAdminsProps> = ({ projectId }) => {
  const [loading, setLoading] = useState(false)
  const [deleteWarnOpen, setDeleteWarnOpen] = useState(false)
  const [deleteUserId, setDeleteUserId] = useState<number>()
  const [refresh, setRefresh] = useState<boolean>(false)
  const admins = useStore((state) => state.selectedProjectAdmins)
  const setAdmins = useStore((state) => state.setSelectedProjectAdmins)

  const handleDeleteButtonClick = (userId: number) => {
    setDeleteUserId(userId)
    setDeleteWarnOpen(true)
  }

  const handleDelete = () => {
    if (!deleteUserId) return
    setLoading(true)
    removeAdminFromprojectApi(projectId, deleteUserId)
      .then(() => {
        message.success('User removed successfully')
        setRefresh((prev) => !prev)
      })
      .catch((e: Error) => {
        message.error(e.message)
      })
      .finally(() => {
        setDeleteWarnOpen(false)
        setLoading(false)
      })
  }

  const columns: ColumnsType<User> = useMemo(
    () => [
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
        render: (_, { id }) => (
          <Space size="middle">
            <DeleteOutlined
              style={{ cursor: 'pointer' }}
              onClick={() => handleDeleteButtonClick(id)}
            />
          </Space>
        ),
      },
    ],
    [handleDeleteButtonClick]
  )

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
  }, [refresh])

  return (
    <>
      <CustomTable
        className={styles.projectAsminContainer}
        loading={loading}
        columns={columns}
        dataSource={admins}
        pagination={false}
      />
      <DeleteConfirmationModal
        message="Are you sure you want to remove user as admin?"
        open={deleteWarnOpen}
        onCancel={() => setDeleteWarnOpen(false)}
        onDelete={handleDelete}
      />
    </>
  )
}
export default ProjectAdmins
