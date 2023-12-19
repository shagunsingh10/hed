import { addUserToKgApi } from '@/apis/kgs'
import { getAllUsersApi } from '@/apis/users'
import { KG_CONTRIBUTOR, KG_OWNER, KG_VIEWER } from '@/constants'
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
  projectId: string
  kgId: string
  open: boolean
  onClose: () => void
}

const AddUserForm: FC<createKgFormProps> = ({
  projectId,
  kgId,
  open,
  onClose,
}) => {
  const [loading, setLoading] = useState(false)
  const users = useStore((state) => state.users)
  const setUsers = useStore((state) => state.setUsers)

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
    addUserToKgApi(projectId, kgId, values.user, values.role)
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
    if (!users) {
      getAllUsersApi()
        .then((users) => setUsers(users))
        .catch((e: Error) => {
          showNotification({ message: e.message.toString(), color: 'red' })
        })
    }
  }, [])

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
          data={[KG_VIEWER, KG_CONTRIBUTOR, KG_OWNER]}
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
