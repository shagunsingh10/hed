import { createKgApi } from '@/apis/kgs'
import useStore from '@/store'
import { Button, Card, Form, Input, message, Modal, Typography } from 'antd'
import { FC, useRef, useState } from 'react'
import styles from './kg.module.scss'

type createKgFormProps = {
  projectId: string
  open: boolean
  onClose: () => void
}

const CreateKGForm: FC<createKgFormProps> = ({ projectId, open, onClose }) => {
  const [loading, setLoading] = useState(false)
  const addNewKg = useStore((state) => state.addNewKg)
  const formRef: any = useRef(null)

  const handleSubmit = async (values: any) => {
    setLoading(true)
    createKgApi(projectId, {
      projectId: projectId,
      name: values.name,
      description: values.description,
      tags: values.tags,
    })
      .then((kg) => {
        message.success('Knowledge Created Successfully')
        addNewKg(kg)
        handleReset()
      })
      .catch((e: Error) => {
        console.log(e.message.toString())
        message.error(e.message.toString())
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const handleReset = () => {
    formRef.current?.resetFields()
    onClose()
  }

  return (
    <Modal
      open={open}
      destroyOnClose={true}
      footer={false}
      closeIcon={false}
      centered={false}
    >
      <Card className={styles.newKGFormContainer}>
        <Typography.Title level={3}>
          Create a new knowledge group
        </Typography.Title>
        <Form
          onFinish={handleSubmit}
          onReset={handleReset}
          layout="vertical"
          ref={formRef}
        >
          <div className={styles.formItemsContainer}>
            <Form.Item
              label="Name"
              name="name"
              rules={[
                {
                  required: true,
                  message: 'Please enter a name for this knowledge group.',
                },
              ]}
            >
              <Input placeholder="Name is required" />
            </Form.Item>

            <Form.Item label="KG Description" name="description">
              <Input.TextArea
                rows={6}
                placeholder="Please enter a short description for this KG"
              />
            </Form.Item>

            <Form.Item label="Tags" name="tags">
              <Input placeholder="Enter tags asscoiated with this knowledge group (comma-separated)" />
            </Form.Item>
          </div>
          <Form.Item>
            <div className={styles.formButtonGroup}>
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

export default CreateKGForm
