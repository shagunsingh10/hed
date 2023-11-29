import { addNewChatApi } from '@/apis/chats'
import { getProjectsApi } from '@/apis/projects'
import useStore from '@/store'
import {
  Button,
  Card,
  Form,
  Input,
  message,
  Modal,
  Select,
  Typography,
} from 'antd'
import { FC, useEffect, useState } from 'react'
import styles from './form.module.scss'

const { Option } = Select

type addChatFormProps = {
  onClose: () => void
  open: boolean
}

const AddChatForm: FC<addChatFormProps> = ({ onClose, open }) => {
  const [loading, setLoading] = useState(false)
  const projects = useStore((state) => state.projects)
  const setProjects = useStore((state) => state.setProjects)
  const addChat = useStore((state) => state.addChat)

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      addNewChatApi(values.title, values.projectId)
        .then((chat) => addChat(chat))
        .catch((e: Error) => message.error(e.message.toString()))
        .finally(() => {
          setLoading(false)
          onClose()
        })
    } catch (e: any) {
      message.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    getProjectsApi()
      .then((projects) => {
        setProjects(projects)
      })
      .catch(() => {
        message.error('Some error occurred in fetching projects')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return (
    <Modal
      open={open}
      width={'40vw'}
      footer={false}
      closeIcon={false}
      destroyOnClose={true}
    >
      <Card className={styles.formContainer}>
        <Typography.Title level={3}>Add new chat</Typography.Title>
        <Form onFinish={handleSubmit} onReset={onClose} layout="vertical">
          <Form.Item
            label="Chat Title"
            name="title"
            rules={[
              {
                required: true,
                message: 'Please enter a title for your chat',
              },
            ]}
          >
            <Input placeholder="Chat title" />
          </Form.Item>
          <Form.Item label="Attach a project" name="projectId">
            <Select showSearch={true}>
              {projects.map((e) => (
                <Option key={e.id} value={e.id}>
                  {e.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <div className={styles.buttonGroup}>
              <Button color="secondary" htmlType="reset" loading={loading}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Create
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </Modal>
  )
}

export default AddChatForm
