import { createProjectApi } from '@/apis/projects'
import useStore from '@/store'
import { Button, Card, Form, Input, message, Modal } from 'antd'
import { useState } from 'react'
import styles from './projects.module.scss'

type createProjectFormProps = {
  closeProjectCreationForm: () => void
  open: boolean
}

const CreateProjectForm: React.FC<createProjectFormProps> = ({
  closeProjectCreationForm,
  open,
}) => {
  const [loading, setLoading] = useState(false)
  const addNewProject = useStore((state) => state.addNewProject)

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      createProjectApi({
        name: values.projectName,
        description: values.projectDescription,
        tags: values.projectTags,
      })
        .then((project) => {
          addNewProject(project)
          closeProjectCreationForm()
        })
        .catch(() => {
          message.error('Some error occurred in creating project')
        })
        .finally(() => {
          message.success('Project Created Successfully')
        })
    } catch (e: any) {
      message.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      width={'40vw'}
      footer={false}
      closeIcon={false}
      destroyOnClose={true}
    >
      <Card className={styles.newProjectFormContainer}>
        <Form
          onFinish={handleSubmit}
          onReset={closeProjectCreationForm}
          layout="vertical"
        >
          <div className={styles.formItemsContainer}>
            <Form.Item
              label="Project Name"
              name="projectName"
              rules={[
                { required: true, message: 'Please enter the project name' },
              ]}
            >
              <Input placeholder="Enter project name" />
            </Form.Item>

            <Form.Item
              label="Project Description"
              name="projectDescription"
              rules={[
                {
                  required: true,
                  message: 'Please enter the project description',
                },
              ]}
            >
              <Input.TextArea
                rows={6}
                placeholder="Enter project description"
              />
            </Form.Item>

            <Form.Item label="Project Tags" name="projectTags">
              <Input placeholder="Enter project tags (comma-separated)" />
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

export default CreateProjectForm
