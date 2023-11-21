import { useMediaQuery } from '@/hooks/useMediaQuery'
import styles from './kg.module.scss'
import KgList from './kgList'
import KgListMobile from './kgListMobile'

type KGScreenProps = {
  projectId: string
}

const KGScreen: React.FC<KGScreenProps> = ({ projectId }) => {
  const smallScreen = useMediaQuery(768)

  return (
    <div className={styles.kgContainer}>
      {smallScreen ? (
        <KgListMobile projectId={projectId} />
      ) : (
        <KgList projectId={projectId} />
      )}
    </div>
  )
}

export default KGScreen
