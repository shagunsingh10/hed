import { addAdminToprojectApi } from '@/apis/projects'
import useStore from '@/store'
import { Button, Card, Form, message, Modal, Select, Typography } from 'antd'
import { FC, useEffect, useRef, useState } from 'react'
import styles from './admin.module.scss'

const { Option } = Select

type createKgFormProps = {
  projectId: string
  open: boolean
  onClose: () => void
}

const AddUserForm: FC<createKgFormProps> = ({ projectId, open, onClose }) => {
  const [loading, setLoading] = useState(false)
  const users = useStore((state) => state.users)
  const loadUsers = useStore((state) => state.loadUsers)
  const formRef: any = useRef(null)

  const handleSubmit = async (values: any) => {
    setLoading(true)
    addAdminToprojectApi(projectId, values.user)
      .then(() => {
        message.success('User added successfully')
        handleReset()
      })
      .catch((e: Error) => {
        message.error(e.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const handleReset = () => {
    formRef.current?.resetFields()
    onClose()
  }

  useEffect(() => {
    if (loadUsers) loadUsers()
  }, [loadUsers])

  return (
    <Modal
      open={open}
      destroyOnClose={true}
      footer={false}
      closeIcon={false}
      centered={false}
    >
      <Card className={styles.newProjectFormContainer}>
        <Typography.Title level={3}>Add new admin</Typography.Title>
        <Form
          onFinish={handleSubmit}
          onReset={handleReset}
          layout="vertical"
          ref={formRef}
        >
          <div className={styles.formItemsContainer}>
            <Form.Item
              label="User"
              name="user"
              rules={[
                {
                  required: true,
                  message: 'Please enter the name of user.',
                },
              ]}
            >
              <Select
                showSearch
                filterOption={(inputValue, option) =>
                  option?.children
                    ?.toLocaleString()
                    .toLowerCase()
                    .includes(inputValue.toLowerCase()) || false
                }
                placeholder="Select the user you want to add"
              >
                {users.map((e) => (
                  <Option key={e.id} value={e.id}>
                    {e.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          <Form.Item>
            <div className={styles.formButtonGroup}>
              <Button color="secondary" htmlType="reset" loading={loading}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Add
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </Modal>
  )
}

export default AddUserForm
