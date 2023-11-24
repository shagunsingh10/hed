import { getKgMemebersApi } from '@/apis/kgs'
import CustomTable from '@/components/Table'
import { KgMember } from '@/types/kgs'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { FC, useEffect, useState } from 'react'

type KgUsersProps = {
  kgId: string
}

const columns: ColumnsType<KgMember> = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (text) => <a>{text}</a>,
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: 'Role',
    dataIndex: 'role',
    key: 'role',
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
      loading={loading}
      columns={columns}
      dataSource={kgMembers}
      pagination={false}
    />
  )
}

export default KgUsers
