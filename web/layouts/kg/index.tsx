import { useDebouncedCallback } from '@/hooks/useDebounceCallback'
import useStore from '@/store'
import { Kg } from '@/types/kgs'
import { Input } from 'antd'
import { useEffect, useState } from 'react'
import styles from './kg.module.scss'
import KGGrid from './kgGrid'

const { Search } = Input

type KGScreenProps = {
  projectId: string
}

const KGScreen: React.FC<KGScreenProps> = ({ projectId }) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [filteredKgs, setFilteredKgs] = useState<Kg[]>([])

  const kgs = useStore((state) => state.kgs)
  const getKgs = useStore((state) => state.getKgs)

  const onChange = useDebouncedCallback((text: string) => {
    setFilteredKgs(
      kgs.filter(
        (e) =>
          e.name.toLocaleLowerCase().includes(text.toLocaleLowerCase()) ||
          e.tags
            .toString()
            .toLocaleLowerCase()
            .includes(text.toLocaleLowerCase()) ||
          e.description?.toLocaleLowerCase().includes(text.toLocaleLowerCase())
      )
    )
  }, 100)

  useEffect(() => setFilteredKgs(kgs), [kgs])

  useEffect(() => {
    if (getKgs) {
      getKgs(projectId).finally(() => setLoading(false))
    }
  }, [getKgs])

  return (
    <div className={styles.kgContainer}>
      <div className={styles.screenHeader}>
        <div className={styles.screenTitle} />
        <Search
          className={styles.search}
          placeholder="Search knowledge group by name or tags or description"
          size="large"
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      <KGGrid projectId={projectId} kgs={filteredKgs} loading={loading} />
    </div>
  )
}

export default KGScreen
