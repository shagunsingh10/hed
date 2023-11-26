import { getKgsApi } from '@/apis/kgs'
import { useDebouncedCallback } from '@/hooks/useDebounceCallback'
import useStore from '@/store'
import { Kg } from '@/types/kgs'
import { PlusCircleOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Input, message } from 'antd'
import { useEffect, useState } from 'react'
import CreateKGForm from './createKg'
import styles from './kg.module.scss'
import KGGrid from './kgGrid'

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
          e.description?.toLocaleLowerCase().includes(text.toLocaleLowerCase())
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
        console.log(e)
        message.error('Some error occurred in fetching knowledge groups.')
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className={styles.kgContainer}>
      <div className={styles.screenHeader}>
        <Input
          prefix={<SearchOutlined />}
          className={styles.search}
          placeholder="Search knowledge groups by name or tags or description"
          onChange={(e) => onChange(e.target.value)}
        />
        <Button onClick={() => setOpen(true)} type="primary">
          <PlusCircleOutlined /> Create New
        </Button>
      </div>
      <KGGrid projectId={projectId} kgs={filteredKgs} loading={loading} />
      <CreateKGForm
        projectId={projectId}
        open={open}
        onClose={() => setOpen(false)}
      />
    </div>
  )
}

export default KGScreen
