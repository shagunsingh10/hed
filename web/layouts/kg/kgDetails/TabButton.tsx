import CreateAssetForm from '@/layouts/asset/createAsset'
import { PlusCircleOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { FC, useState } from 'react'
import AddUserForm from '../kgUsers/addUserForm'

type TabContentProps = {
  activeTab: number
  projectId: string
  kgId: string
}

const TabContentAsset: FC<TabContentProps> = ({
  activeTab,
  projectId,
  kgId,
}) => {
  const [open, setOpen] = useState(false)

  if (activeTab === 1) {
    return (
      <div>
        <Button onClick={() => setOpen(true)} type="primary" size="middle">
          <PlusCircleOutlined /> Create Asset
        </Button>
        <CreateAssetForm
          projectId={projectId}
          kgId={kgId}
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
          <PlusCircleOutlined /> Add User
        </Button>
        <AddUserForm kgId={kgId} open={open} onClose={() => setOpen(false)} />
      </div>
    )
  }

  return <></>
}

export default TabContentAsset
