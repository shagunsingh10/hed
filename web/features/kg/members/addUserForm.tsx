import { addUserToKgApi } from '@/apis/kgs'
import useStore from '@/store'
import {
  Button,
  ComboboxItem,
  Group,
  Modal,
  OptionsFilter,
  Select,
} from '@mantine/core'
import { isNotEmpty, useForm } from '@mantine/form'
import { showNotification } from '@mantine/notifications'
import { IconUserCircle } from '@tabler/icons-react'
import { FC, useEffect, useState } from 'react'

type createKgFormProps = {
  kgId: string
  open: boolean
  onClose: () => void
}

const AddUserForm: FC<createKgFormProps> = ({ kgId, open, onClose }) => {
  const [loading, setLoading] = useState(false)
  const users = useStore((state) => state.users)
  const loadUsers = useStore((state) => state.loadUsers)

  const form = useForm({
    initialValues: {
      user: '',
      role: '',
    },
    validate: {
      user: isNotEmpty('Select a user'),
      role: isNotEmpty('Select a user'),
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
    addUserToKgApi(kgId, values.user, values.role)
      .then(() => {
        showNotification({
          color: 'green',
          message: 'User added succesfully',
        })
        handleReset()
      })
      .catch((e: Error) => {
        showNotification({
          color: 'red',
          message: e.message,
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

  useEffect(() => {
    if (loadUsers) loadUsers()
  }, [loadUsers])

  return (
    <Modal
      opened={open}
      onClose={handleReset}
      title="Add Member"
      closeOnClickOutside={false}
    >
      <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
        <Select
          leftSection={<IconUserCircle size={20} />}
          size="xs"
          label="User"
          placeholder="Select the user you want to add"
          filter={optionsFilter}
          searchable
          {...form.getInputProps('user')}
          data={users.map((e) => ({ value: e.id.toString(), label: e.name }))}
        />
        <Select
          size="xs"
          label="Role"
          placeholder="Select the user you want to add"
          filter={optionsFilter}
          searchable
          {...form.getInputProps('role')}
          data={['viewer', 'contributor', 'owner']}
        />
        <Group mt="lg" justify="flex-end">
          <Button type="submit" loading={loading} size="xs">
            Add
          </Button>
        </Group>
      </form>
    </Modal>
  )
}

export default AddUserForm
