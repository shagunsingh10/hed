import { deleteAssetApi } from '@/apis/assets'
import DeleteConfirmationModal from '@/components/Modals/DeleteWarn'
import { Menu, rem } from '@mantine/core'
import { showNotification } from '@mantine/notifications'
import { IconDots, IconFileInvoice, IconTrash } from '@tabler/icons-react'
import { useCallback, useState } from 'react'
import LogModal from '../logs'
import styles from './assets.module.scss'

const AssetMenu = ({
  projectId,
  assetId,
}: {
  projectId: string
  assetId: string
}) => {
  const [deleteWarnOpen, setDeleteWarn] = useState(false)
  const [assetIdToDelete, setAssetIdToDelete] = useState('')
  const [logModalOpen, setLogModalOpen] = useState(false)
  const [assetIdLogModal, setAssetIdLogModal] = useState('')

  const openLogModal = () => {
    setAssetIdLogModal(assetId)
    setLogModalOpen(true)
  }

  const openDeleteWarning = () => {
    setAssetIdToDelete(assetId)
    setDeleteWarn(true)
  }

  const deleteAsset = useCallback(
    (assetId: string) => {
      deleteAssetApi(projectId, assetId)
        .catch((e: Error) => {
          showNotification({ message: e.message.toString(), color: 'red' })
        })
        .finally(() => {
          setDeleteWarn(false)
        })
    },
    [projectId]
  )

  return (
    <>
      <Menu shadow="md" width={200}>
        <Menu.Target>
          <IconDots size={20} className={styles.menuIcon} />
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>Asset</Menu.Label>
          <Menu.Item
            leftSection={
              <IconFileInvoice style={{ width: rem(14), height: rem(14) }} />
            }
            onClick={openLogModal}
          >
            View logs
          </Menu.Item>

          <Menu.Divider />

          <Menu.Label>Danger zone</Menu.Label>
          <Menu.Item
            color="red"
            leftSection={
              <IconTrash style={{ width: rem(14), height: rem(14) }} />
            }
            onClick={openDeleteWarning}
          >
            Delete asset
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
      <DeleteConfirmationModal
        open={deleteWarnOpen}
        onCancel={() => setDeleteWarn(false)}
        onDelete={() => deleteAsset(assetIdToDelete)}
        message="Are you sure you want to delete the asset? It is non reversible."
      />
      <LogModal
        projectId={projectId}
        open={logModalOpen}
        onClose={() => setLogModalOpen(false)}
        assetId={assetIdLogModal}
      />
    </>
  )
}

export default AssetMenu
