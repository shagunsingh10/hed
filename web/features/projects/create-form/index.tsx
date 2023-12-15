import { createProjectApi } from '@/apis/projects'
import useStore from '@/store'
import { Button, Group, Modal, Textarea, TextInput } from '@mantine/core'
import { isNotEmpty, useForm } from '@mantine/form'
import { showNotification } from '@mantine/notifications'
import { useCallback, useState } from 'react'
import styles from './form.module.scss'

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

  const form = useForm({
    initialValues: {
      projectName: '',
      projectDescription: '',
    },
    validate: {
      projectName: isNotEmpty('Enter project name'),
      projectDescription: isNotEmpty('Enter project name'),
    },
  })

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
          showNotification({
            message: 'Some error occurred in creating project',
            color: 'red',
          })
        })
        .finally(() => {
          form.reset()
          showNotification({
            message: 'Project Created Successfully',
            color: 'green',
          })
        })
    } catch (e: any) {
      showNotification({
        message: e,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = useCallback(() => {
    form.reset()
    closeProjectCreationForm()
  }, [closeProjectCreationForm, form])

  return (
    <Modal
      opened={open}
      onClose={handleClose}
      title="Create new project"
      closeOnClickOutside={false}
    >
      <form
        onSubmit={form.onSubmit((values) => handleSubmit(values))}
        className={styles.form}
      >
        <TextInput
          size="xs"
          label="Project Name"
          placeholder="Enter project name"
          withAsterisk
          {...form.getInputProps('projectName')}
        />

        <Textarea
          size="xs"
          label="Project Description"
          rows={6}
          withAsterisk
          placeholder="Enter project description"
          {...form.getInputProps('projectDescription')}
        />

        <TextInput
          size="xs"
          label="Tags"
          placeholder="Enter project tags (comma-separated)"
          {...form.getInputProps('projectTags')}
        />
        <Group justify="flex-end" mt="md">
          <Button loading={loading} type="submit" size="xs">
            Create
          </Button>
        </Group>
      </form>
    </Modal>
  )
}

export default CreateProjectForm
