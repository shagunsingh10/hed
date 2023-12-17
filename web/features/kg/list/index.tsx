import OverlayLoader from '@/components/Loader'
import { globalDateFormatParser } from '@/lib/utils/functions'
import { Kg } from '@/types/kgs'
import { Badge } from '@mantine/core'
import { IconCalendar, IconHexagonalPrism, IconUser } from '@tabler/icons-react'
import { DataTable } from 'mantine-datatable'
import { useRouter } from 'next/navigation'
import { FC, useMemo } from 'react'
import styles from './list.module.scss'

type KgListProps = {
  projectId: string
  kgs: Kg[]
  loading: boolean
}

const KGList: FC<KgListProps> = ({ projectId, kgs, loading }) => {
  const { push } = useRouter()

  const handleKgClick = (id: string) => {
    push(`/projects/${projectId}/kgs/${id}`, {
      scroll: false,
    })
  }

  const columns: any = useMemo(
    () => [
      {
        label: 'Name',
        accessor: 'name',
        width: '20%',
        render: (record: any) => (
          <span className={styles.kgTitle}>
            <IconHexagonalPrism size={15} />
            {record.name}
          </span>
        ),
      },
      {
        label: 'Tags',
        accessor: 'tags',
        textAlign: 'center',
        width: '20%',
        render: (record: any) => (
          <div className={styles.tags}>
            {record?.tags?.slice(0, 2)?.map((tag: string) => {
              return (
                <Badge size="xs" variant="light">
                  {tag}
                </Badge>
              )
            })}
          </div>
        ),
      },
      {
        label: 'Created By',
        accessor: 'createdBy',
        textAlign: 'center',
        render: (record: any) => (
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
        render: (record: any) => (
          <span className={styles.tableCell}>
            <IconCalendar size={15} />
            {globalDateFormatParser(new Date(record.createdAt))}
          </span>
        ),
      },
    ],
    []
  )

  if (loading) return <OverlayLoader />

  return (
    <div className={styles.kgListContainer}>
      <DataTable
        classNames={{
          header: styles.headerRow,
        }}
        className={styles.assetList}
        columns={columns}
        onRowClick={({ record }) => handleKgClick(record.id)}
        records={kgs}
        withTableBorder
        borderRadius="sm"
        striped
        highlightOnHover
      />
    </div>
  )
}

export default KGList
