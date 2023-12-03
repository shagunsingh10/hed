import { getKgMemebersApi, removeUserFromKgApi } from '@/apis/kgs'
import UserAvatar from '@/components/Avatar'
import DeleteConfirmationModal from '@/components/Modals/DeleteWarn'
import CustomTable from '@/components/Table'
import { KgMember } from '@/types/kgs'
import { DeleteFilled } from '@ant-design/icons'
import { message, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { FC, useEffect, useMemo, useState } from 'react'
import styles from './users.module.scss'

type KgUsersProps = {
  kgId: string
}

const KgUsers: FC<KgUsersProps> = ({ kgId }) => {
  const [kgMembers, setKgMembers] = useState<KgMember[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [refresh, setRefresh] = useState(false)
  const [deleteWarnOpen, setDeleteWarnOpen] = useState(false)
  const [deleteUserId, setDeleteUserId] = useState<number>()

  const handleDelete = async () => {
    if (!deleteUserId) return
    setLoading(true)
    removeUserFromKgApi(kgId, deleteUserId)
      .then(() => {
        message.success('User removed successfully')
        setRefresh((prev) => !prev)
      })
      .catch((e: Error) => {
        message.error(e.message)
      })
      .finally(() => {
        setLoading(false)
        setDeleteWarnOpen(false)
      })
  }

  const handleDeleteButtonClick = (userId: number) => {
    setDeleteUserId(userId)
    setDeleteWarnOpen(true)
  }

  const columns: ColumnsType<KgMember> = useMemo(
    () => [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: (_, record) => (
          <span className={styles.kgTitle}>
            <UserAvatar userId={record.id} />
            {record.name}
          </span>
        ),
      },
      {
        title: 'Role',
        dataIndex: 'role',
        key: 'role',
        align: 'center',
      },
      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
        align: 'center',
      },
      {
        title: 'Action',
        key: 'action',
        align: 'center',
        width: '10%',
        render: (_, { id }) => (
          <Space size="middle">
            <DeleteFilled
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
    getKgMemebersApi(kgId)
      .then((data) => {
        setKgMembers(data)
      })
      .finally(() => setLoading(false))
  }, [refresh])

  return (
    <>
      <CustomTable
        className={styles.kgUsersContainer}
        loading={loading}
        columns={columns}
        dataSource={kgMembers}
        pagination={false}
      />
      <DeleteConfirmationModal
        message="Are you sure you want to remove user from this knowledge group? He will no longer have access to the assets in this knowledge group"
        open={deleteWarnOpen}
        onCancel={() => setDeleteWarnOpen(false)}
        onDelete={handleDelete}
      />
    </>
  )
}

export default KgUsers
