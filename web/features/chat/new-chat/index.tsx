import { addNewChatApi } from '@/apis/chats'
import { getProjectsApi } from '@/apis/projects'
import useStore from '@/store'
import {
  Button,
  ComboboxItem,
  Group,
  Modal,
  OptionsFilter,
  Select,
  TextInput,
} from '@mantine/core'
import { isNotEmpty, useForm } from '@mantine/form'
import { showNotification } from '@mantine/notifications'
import { IconMessagePlus } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import styles from './form.module.scss'

const AddChatForm = () => {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const projects = useStore((state) => state.projects)
  const setProjects = useStore((state) => state.setProjects)
  const addChat = useStore((state) => state.addChat)

  const form = useForm({
    initialValues: {
      title: '',
    },
    validate: {
      title: isNotEmpty('Enter a title'),
    },
  })

  const optionsFilter: OptionsFilter = ({ options, search }) => {
    const splittedSearch = search.toLowerCase().trim().split(' ')
    return (options as ComboboxItem[]).filter((option) => {
      const words = option.label.toLowerCase().trim().split(' ')
      return splittedSearch.every((searchWord) =>
        words.some((word) => word.includes(searchWord))
      )
    })
  }

  const handleSubmit = async (values: any) => {
    setLoading(true)
    addNewChatApi(values.title, values.projectId)
      .then((chat) => addChat(chat))
      .catch((e: Error) =>
        showNotification({
          message: e.message.toString(),
          color: 'red',
        })
      )
      .finally(() => {
        setLoading(false)
        setOpen(false)
        form.reset()
      })
  }

  const onClose = () => {
    form.reset()
    setOpen(false)
  }

  useEffect(() => {
    setLoading(true)
    getProjectsApi()
      .then((projects) => {
        setProjects(projects)
      })
      .catch(() => {
        showNotification({
          message: 'Some error occurred in fetching projects',
          color: 'red',
        })
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return (
    <>
      <Button
        size="xs"
        onClick={() => setOpen(true)}
        className={styles.addChatBtn}
        leftSection={<IconMessagePlus size={15} />}
      >
        New Chat
      </Button>
      <Modal opened={open} onClose={onClose} title="New chat">
        <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
          <TextInput
            size="xs"
            label="Chat Title"
            placeholder="Chat title"
            {...form.getInputProps('title')}
          />
          <Select
            size="xs"
            label="Project"
            placeholder="Select a project you want to tag"
            filter={optionsFilter}
            searchable
            {...form.getInputProps('projectId')}
            data={projects.map((p) => ({
              value: p.id,
              label: p.name,
            }))}
          />
          <Group mt="lg" justify="flex-end">
            <Button type="submit" loading={loading} size="xs">
              Add
            </Button>
          </Group>
        </form>
      </Modal>
    </>
  )
}

export default AddChatForm
