import { Button, Group, Modal, Stack, Text } from '@mantine/core'
import { IconAlertTriangle } from '@tabler/icons-react'
import { FC } from 'react'

type DeleteConfirmationModalProps = {
  open: boolean
  message: string
  onDelete: () => any
  onCancel: () => any
}
const DeleteConfirmationModal: FC<DeleteConfirmationModalProps> = ({
  open,
  message,
  onDelete,
  onCancel,
}) => {
  return (
    <Modal opened={open} onClose={onCancel} size="md">
      <Stack justify="center" align="center">
        <IconAlertTriangle size={30} color="red" />
        <Text size="md">{message}</Text>
      </Stack>

      <Group mt="sm" justify="flex-end">
        <Button onClick={onDelete} size="xs">
          Delete
        </Button>
      </Group>
    </Modal>
  )
}

export default DeleteConfirmationModal
