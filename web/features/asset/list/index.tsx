import { deleteAssetApi } from '@/apis/assets'
import OverlayLoader from '@/components/Loader'
import DeleteConfirmationModal from '@/components/Modals/DeleteWarn'
import {
  ASSET_APPROVAL_PENDING,
  ASSET_DELETE_FAILED,
  ASSET_DELETING,
  ASSET_INGESTING,
  ASSET_INGESTION_FAILED,
  ASSET_INGESTION_IN_QUEUE,
  ASSET_INGESTION_SUCCESS,
  ASSET_REJECTED,
  ERROR_COLOR,
  INFO_COLOR,
  SUCCESS_COLOR,
  WARNING_COLOR,
} from '@/constants'
import { globalDateFormatParser } from '@/lib/utils/functions'
import type { Asset } from '@/types/assets'
import { ActionIcon, Badge } from '@mantine/core'
import { showNotification } from '@mantine/notifications'
import {
  IconCalendar,
  IconChecklist,
  IconCircleCheck,
  IconCircleX,
  IconCpu,
  IconCube,
  IconEraserOff,
  IconExclamationCircle,
  IconFileAnalytics,
  IconTrashFilled,
  IconUser,
} from '@tabler/icons-react'
import { DataTable } from 'mantine-datatable'
import { useCallback, useMemo, useState } from 'react'
import AssetDocs from '../docs'
import LogModal from '../logs'
import styles from './assets.module.scss'

type AssetListProps = {
  projectId: string
  kgId: string
  assets: Asset[]
  loading: boolean
  pageSize: number
  page: number
  totalSize: number
  onPageChange: (p: number) => void
}

const AssetList: React.FC<AssetListProps> = ({
  assets,
  projectId,
  kgId,
  loading,
  page,
  onPageChange,
  pageSize,
  totalSize,
}) => {
  const [deleteWarnOpen, setDeleteWarn] = useState(false)
  const [assetIdToDelete, setAssetIdToDelete] = useState('')
  const [logModalOpen, setLogModalOpen] = useState(false)
  const [assetIdLogModal, setAssetIdLogModal] = useState('')

  const openLogModal = (assetId: string) => {
    setAssetIdLogModal(assetId)
    setLogModalOpen(true)
  }

  const openDeleteWarning = (assetId: string) => {
    setAssetIdToDelete(assetId)
    setDeleteWarn(true)
  }

  const deleteAsset = useCallback(
    (assetId: string) => {
      loading = true
      deleteAssetApi(projectId, kgId, assetId)
        .catch((e: Error) => {
          showNotification({ message: e.message.toString(), color: 'red' })
        })
        .finally(() => {
          loading = false
          setDeleteWarn(false)
        })
    },
    [kgId, projectId]
  )

  const columns: any = useMemo(
    () => [
      {
        label: 'Name',
        accessor: 'name',
        width: '20%',
        render: (record: Asset) => (
          <span className={styles.assetTitle}>
            <IconCube size={15} />
            {record.name}
          </span>
        ),
      },
      {
        label: 'Tags',
        accessor: 'tags',
        textAlign: 'center',
        width: '20%',
        render: (record: Asset) => (
          <div className={styles.tags}>
            {record?.tags?.slice(0, 2)?.map((tag: string) => {
              return (
                tag.trim() && (
                  <Badge variant="light" size="xs">
                    {tag}
                  </Badge>
                )
              )
            })}
          </div>
        ),
      },
      {
        label: 'Created By',
        accessor: 'createdBy',
        textAlign: 'center',
        render: (record: Asset) => (
          <span className={styles.tableCell}>
            <IconUser size={15} />
            {record.createdBy}
          </span>
        ),
      },
      {
        label: 'Created At',
        accessor: 'createdAt',
        textAlign: 'center',
        render: (record: Asset) => (
          <span className={styles.tableCell}>
            <IconCalendar size={15} />
            {globalDateFormatParser(new Date(record.createdAt))}
          </span>
        ),
      },
      {
        label: 'Status',
        accessor: 'status',
        textAlign: 'center',
        render: ({ status }: Asset) => {
          let color = WARNING_COLOR
          if (status === ASSET_INGESTION_FAILED) color = ERROR_COLOR
          if (status === ASSET_INGESTION_SUCCESS) color = SUCCESS_COLOR
          if (status === ASSET_INGESTING) color = INFO_COLOR
          if (status === ASSET_DELETING) color = 'orange'
          if (status === ASSET_DELETE_FAILED) color = ERROR_COLOR
          if (status === ASSET_REJECTED) color = ERROR_COLOR
          return (
            <span style={{ background: color }} className={styles.status}>
              {status === ASSET_INGESTION_IN_QUEUE && (
                <IconExclamationCircle size={12} />
              )}
              {status === ASSET_INGESTION_SUCCESS && (
                <IconCircleCheck size={12} />
              )}
              {status === ASSET_INGESTION_FAILED && <IconCircleX size={12} />}
              {status === ASSET_REJECTED && <IconCircleX size={12} />}
              {status === ASSET_INGESTING && <IconCpu size={12} />}
              {status === ASSET_DELETING && <IconEraserOff size={12} />}
              {status === ASSET_DELETE_FAILED && (
                <IconExclamationCircle size={12} />
              )}
              {status === ASSET_APPROVAL_PENDING && <IconChecklist size={12} />}
              {status.toUpperCase()}
            </span>
          )
        },
      },

      {
        label: 'Action',
        accessor: 'action',
        textAlign: 'center',
        render: (record: Asset) => (
          <>
            {[ASSET_DELETE_FAILED, ASSET_INGESTION_SUCCESS].includes(
              record.status
            ) && (
              <ActionIcon
                variant="transparent"
                onClick={() => openDeleteWarning(record.id)}
              >
                <IconTrashFilled size={15} />
              </ActionIcon>
            )}
            <ActionIcon
              variant="transparent"
              onClick={() => openLogModal(record.id)}
            >
              <IconFileAnalytics size={15} />
            </ActionIcon>
          </>
        ),
      },
    ],
    [deleteAsset]
  )

  if (loading) return <OverlayLoader />

  return (
    <div className={styles.assetListContainer}>
      <DeleteConfirmationModal
        open={deleteWarnOpen}
        onCancel={() => setDeleteWarn(false)}
        onDelete={() => deleteAsset(assetIdToDelete)}
        message="Are you sure you want to delete the asset? It is non reversible."
      />
      <LogModal
        projectId={projectId}
        kgId={kgId}
        open={logModalOpen}
        onClose={() => setLogModalOpen(false)}
        assetId={assetIdLogModal}
      />
      <DataTable
        classNames={{
          header: styles.headerRow,
        }}
        className={styles.assetList}
        columns={columns}
        records={assets}
        withTableBorder
        borderRadius="sm"
        striped
        totalRecords={totalSize}
        recordsPerPage={pageSize}
        page={page}
        onPageChange={onPageChange}
        highlightOnHover
        rowExpansion={{
          content: ({ record }) => (
            <AssetDocs projectId={projectId} kgId={kgId} assetId={record.id} />
          ),
        }}
      />
    </div>
  )
}

export default AssetList
