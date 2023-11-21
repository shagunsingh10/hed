import { PlusCircleOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { FC, useState } from 'react'
import CreateKGForm from '../../kg/createKg'

type TabContentProps = {
  activeTab: number
  projectId: string
}

const TabContent: FC<TabContentProps> = ({ activeTab, projectId }) => {
  const [open, setOpen] = useState(false)

  if (activeTab === 2) {
    return (
      <div>
        <Button
          onClick={() => setOpen(true)}
          type="primary"
          size="middle"
          ghost
        >
          <PlusCircleOutlined /> Create Knowledge Group
        </Button>

        <CreateKGForm
          projectId={projectId}
          open={open}
          onClose={() => setOpen(false)}
        />
      </div>
    )
  }
  return <></>
}

export default TabContent
