import { createKgApi } from '@/apis/kgs'
import useStore from '@/store'
import { Button, Group, Modal, Textarea, TextInput } from '@mantine/core'
import { isNotEmpty, useForm } from '@mantine/form'
import { showNotification } from '@mantine/notifications'
import { FC, useState } from 'react'
import styles from './form.module.scss'

type createKgFormProps = {
  projectId: string
  open: boolean
  onClose: () => void
}

const CreateKGForm: FC<createKgFormProps> = ({ projectId, open, onClose }) => {
  const [loading, setLoading] = useState(false)
  const addNewKg = useStore((state) => state.addNewKg)
  const form = useForm({
    initialValues: {
      name: '',
    },
    validate: {
      name: isNotEmpty('Enter Knowledge Group name'),
    },
  })

  const handleSubmit = async (values: any) => {
    setLoading(true)
    createKgApi(projectId, {
      projectId: projectId,
      name: values.name,
      description: values.description,
      tags: values.tags,
    })
      .then((kg) => {
        showNotification({
          message: 'Knowledge Group created successfully',
          color: 'green',
        })
        addNewKg(kg)
        handleReset()
      })
      .catch((e: Error) => {
        showNotification({
          message: e.message.toString(),
          color: 'red',
        })
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const handleReset = () => {
    form.reset()
    onClose()
  }

  return (
    <Modal opened={open} onClose={onClose} title="Create a new knowledge group">
      <form
        onSubmit={form.onSubmit((values) => handleSubmit(values))}
        className={styles.form}
      >
        <TextInput
          size="xs"
          label="Name"
          withAsterisk
          placeholder="Name is required"
          {...form.getInputProps('name')}
        />
        <Textarea
          size="xs"
          label="Description"
          rows={6}
          placeholder="Please enter a short description for this KG"
          {...form.getInputProps('description')}
        />
        <TextInput
          size="xs"
          label="Tags"
          placeholder="Enter tags asscoiated with this knowledge group (comma-separated)"
          {...form.getInputProps('tags')}
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

export default CreateKGForm
