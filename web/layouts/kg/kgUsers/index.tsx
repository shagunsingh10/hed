import { getKgMemebersApi } from '@/apis/kgs'
import UserAvatar from '@/components/Avatar'
import CustomTable from '@/components/Table'
import { KgMember } from '@/types/kgs'
import { DeleteFilled, EditFilled } from '@ant-design/icons'
import { Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { FC, useEffect, useState } from 'react'
import styles from './users.module.scss'

type KgUsersProps = {
  kgId: string
}

const columns: ColumnsType<KgMember> = [
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
    render: () => (
      <Space size="middle">
        <EditFilled style={{ cursor: 'pointer' }} />
        <DeleteFilled style={{ cursor: 'pointer' }} />
      </Space>
    ),
  },
]

const KgUsers: FC<KgUsersProps> = ({ kgId }) => {
  const [kgMembers, setKgMembers] = useState<KgMember[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    setLoading(true)
    getKgMemebersApi(kgId)
      .then((data) => {
        setKgMembers(data)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <CustomTable
      className={styles.kgUsersContainer}
      loading={loading}
      columns={columns}
      dataSource={kgMembers}
      pagination={false}
    />
  )
}

export default KgUsers
