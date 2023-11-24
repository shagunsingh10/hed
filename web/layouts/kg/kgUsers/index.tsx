import Loader from '@/components/Loader'
import CustomTable from '@/components/Table'
import useStore from '@/store'
import { KgMember } from '@/types/kgs'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import React, { FC, useEffect, useState } from 'react'

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
  const getKgMembersApi = useStore((state) => state.getKgMembers)

  useEffect(() => {
    setLoading(true)
    if (getKgMembersApi)
      getKgMembersApi(kgId)
        .then((data) => {
          console.log(data)
          setKgMembers(data)
        })
        .finally(() => setLoading(false))
  }, [getKgMembersApi])

  if (loading) {
    return <Loader />
  }

  return (
    <div>
      <CustomTable
        columns={columns}
        dataSource={kgMembers}
        pagination={false}
      />
    </div>
  )
}

export default KgUsers
