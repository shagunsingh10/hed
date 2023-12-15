import { Button, Group, Modal } from '@mantine/core'
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
    <Modal opened={open} onClose={onCancel}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          justifyContent: 'center',
        }}
      >
        <IconAlertTriangle size={30} color="red" />
        <span style={{ opacity: 0.7, fontSize: '1.2em', textAlign: 'center' }}>
          {message}
        </span>
      </div>

      <Group mt="lg" justify="flex-end">
        <Button onClick={onDelete} size="xs">
          Delete
        </Button>
      </Group>
    </Modal>
  )
}

export default DeleteConfirmationModal
