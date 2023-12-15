import { getKgsApi } from '@/apis/kgs'
import { useDebouncedCallback } from '@/hooks/useDebounceCallback'
import useStore from '@/store'
import { Kg } from '@/types/kgs'
import { Button, Input } from '@mantine/core'
import { showNotification } from '@mantine/notifications'
import { IconHexagonalPrismPlus, IconSearch } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import CreateKGForm from './create-form'
import styles from './kg.module.scss'
import KgList from './list'

type KGScreenProps = {
  projectId: string
}

const KGScreen: React.FC<KGScreenProps> = ({ projectId }) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [filteredKgs, setFilteredKgs] = useState<Kg[]>([])
  const [open, setOpen] = useState<boolean>(false)

  const kgs = useStore((state) => state.kgs)
  const setkgs = useStore((state) => state.setKgs)

  const onChange = useDebouncedCallback((text: string) => {
    setFilteredKgs(
      kgs.filter(
        (e) =>
          e.name.toLocaleLowerCase().includes(text.toLocaleLowerCase()) ||
          e.tags
            .toString()
            .toLocaleLowerCase()
            .includes(text.toLocaleLowerCase()) ||
          e.description
            ?.toLocaleLowerCase()
            .includes(text.toLocaleLowerCase()) ||
          e.createdBy?.toLocaleLowerCase().includes(text.toLocaleLowerCase())
      )
    )
  }, 100)

  useEffect(() => setFilteredKgs(kgs), [kgs])

  useEffect(() => {
    getKgsApi(projectId)
      .then((kgs) => {
        setkgs(kgs)
      })
      .catch((e: Error) => {
        console.error(e)
        showNotification({
          color: 'red',
          message: 'Some error occurred in fetching knowledge groups.',
        })
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className={styles.kgContainer}>
      <div className={styles.screenHeader}>
        <Input
          size="xs"
          rightSection={<IconSearch size={17} />}
          className={styles.search}
          placeholder="Search knowledge groups by name, tags, description or creator"
          onChange={(e) => onChange(e.target.value)}
        />
        <Button
          size="xs"
          leftSection={<IconHexagonalPrismPlus size={15} />}
          onClick={() => setOpen(true)}
        >
          Create new
        </Button>
      </div>
      <KgList projectId={projectId} kgs={filteredKgs} loading={loading} />
      <CreateKGForm
        projectId={projectId}
        open={open}
        onClose={() => setOpen(false)}
      />
    </div>
  )
}

export default KGScreen
