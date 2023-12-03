import { WarningFilled } from '@ant-design/icons'
import { Button, Card, Modal } from 'antd'
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
    <Modal
      mask={true}
      footer={false}
      open={open}
      width={'40vw'}
      closeIcon={false}
    >
      <Card style={{ padding: '2em 0.5em' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1em',
            justifyContent: 'center',
          }}
        >
          <WarningFilled style={{ fontSize: '4em', color: '#DC3545' }} />
          <span
            style={{ opacity: 0.7, fontSize: '1.2em', textAlign: 'center' }}
          >
            {message}
          </span>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2em' }}>
          <Button onClick={onCancel} style={{ marginRight: '1em' }}>
            Cancel
          </Button>
          <Button onClick={onDelete} danger type="primary">
            Delete
          </Button>
        </div>
      </Card>
    </Modal>
  )
}

export default DeleteConfirmationModal
