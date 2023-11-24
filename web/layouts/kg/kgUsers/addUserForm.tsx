import useStore from '@/store'
import { Button, Card, Form, message, Modal, Select, Typography } from 'antd'
import { FC, useEffect, useRef, useState } from 'react'
import styles from '../kg.module.scss'

const { Option } = Select

type createKgFormProps = {
  kgId: string
  open: boolean
  onClose: () => void
}

const AddUserForm: FC<createKgFormProps> = ({ kgId, open, onClose }) => {
  const [loading, setLoading] = useState(false)
  const users = useStore((state) => state.users)
  const loadUsers = useStore((state) => state.loadUsers)
  const addUserToKg = useStore((state) => state.addUserToKg)
  const formRef: any = useRef(null)

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      addUserToKg(kgId, values.user, values.role)
      message.success('User added successfully')
      handleReset()
    } catch (e: any) {
      message.error(e)
    } finally {
      setLoading(false)
    }
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
      <Card className={styles.newKGFormContainer}>
        <Typography.Title level={3}>Add new user</Typography.Title>
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

            <Form.Item label="Role" name="role">
              <Select placeholder="Select the role you want to assign to the user">
                {['viewer', 'contributor', 'owner'].map((e) => (
                  <Option key={e} value={e}>
                    {e}
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
