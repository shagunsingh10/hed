import CustomTable from '@/components/Table'
import { KgUser } from '@/types/kgs'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import React from 'react'

const columns: ColumnsType<KgUser> = [
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
type KgUserProps = {
  members: KgUser[]
}

const KgUsers: React.FC<KgUserProps> = ({ members }) => {
  return (
    <div>
      <CustomTable columns={columns} dataSource={members} pagination={false} />
    </div>
  )
}

export default KgUsers
