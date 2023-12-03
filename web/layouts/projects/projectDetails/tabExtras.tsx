import CreateKGForm from '@/layouts/kg/createKg'
import { PlusCircleOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { FC, useState } from 'react'
import AddUserForm from '../projectAdmins/addAdminForm'

type TabContentProps = {
  activeTab: number
  projectId: string
}

const TabContentKg: FC<TabContentProps> = ({ activeTab, projectId }) => {
  const [open, setOpen] = useState(false)

  if (activeTab === 1) {
    return (
      <div>
        <Button onClick={() => setOpen(true)} type="primary" size="middle">
          <PlusCircleOutlined /> Create New
        </Button>
        <CreateKGForm
          projectId={projectId}
          open={open}
          onClose={() => setOpen(false)}
        />
      </div>
    )
  }

  if (activeTab === 2) {
    return (
      <div>
        <Button onClick={() => setOpen(true)} type="primary" size="middle">
          <PlusCircleOutlined /> Add Admin
        </Button>
        <AddUserForm
          projectId={projectId}
          open={open}
          onClose={() => setOpen(false)}
        />
      </div>
    )
  }

  return <></>
}

export default TabContentKg
