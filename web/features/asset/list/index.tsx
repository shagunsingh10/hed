import OverlayLoader from '@/components/Loader'
import { globalDateFormatParser } from '@/lib/utils/functions'
import type { Asset } from '@/types/assets'
import {
  IconCalendarClock,
  IconCube,
  IconUserCircle,
} from '@tabler/icons-react'
import { DataTable } from 'mantine-datatable'
import { useMemo } from 'react'
import styles from './assets.module.scss'
import Status from './AssetStatus'
import AssetMenu from './Menu'

type AssetListProps = {
  projectId: string
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
  loading,
  page,
  onPageChange,
  pageSize,
  totalSize,
}) => {
  // const [selectedRecords, setSelectedRecords] = useState<Asset[]>([])

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
        label: 'Type',
        accessor: 'type',
        textAlign: 'center',
        width: '20%',
        render: (record: Asset) => (
          <span className={styles.assetType}>{record.assetType?.name}</span>
        ),
      },
      {
        label: 'Created By',
        accessor: 'createdBy',
        textAlign: 'center',
        render: (record: Asset) => (
          <span className={styles.tableCell}>
            <IconUserCircle size={15} />
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
            <IconCalendarClock size={15} />
            {globalDateFormatParser(new Date(record.createdAt))}
          </span>
        ),
      },
      {
        label: 'Status',
        accessor: 'status',
        textAlign: 'center',
        render: ({ status }: Asset) => <Status status={status} />,
      },

      {
        label: '',
        accessor: '',
        textAlign: 'center',
        render: (record: Asset) => (
          <AssetMenu projectId={projectId} assetId={record.id} />
        ),
      },
    ],
    []
  )

  if (loading) return <OverlayLoader />

  return (
    <div
      className={`${styles.assetListContainer} ${
        assets.length === 0 && styles.emptyTable
      }`}
    >
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
        // selectedRecords={selectedRecords}
        // onSelectedRecordsChange={setSelectedRecords}
        totalRecords={totalSize}
        recordsPerPage={pageSize}
        page={page}
        onPageChange={onPageChange}
        highlightOnHover
      />
    </div>
  )
}

export default AssetList
