import { WarningFilled } from '@ant-design/icons'
import { Button, Modal } from 'antd'
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
      width={'50vw'}
      closeIcon={false}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1em',
          margin: '0 3em',
          padding: '3em 0.5em',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1em' }}>
          <WarningFilled style={{ fontSize: '1.7em', color: '#DC3545' }} />
          <span style={{ opacity: 0.7, fontSize: '1.2em' }}>{message}</span>
        </div>

        <div>
          <Button onClick={onCancel} style={{ marginRight: '1em' }}>
            Cancel
          </Button>
          <Button onClick={onDelete} danger type="primary">
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default DeleteConfirmationModal
