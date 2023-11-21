import { useMediaQuery } from '@/hooks/useMediaQuery'
import styles from './asset.module.scss'
import AssetList from './assetList'
import AssetListMobile from './assetListMobile'

type AssetScreenProps = {
  projectId: string
  kgId?: string
}

const AssetScreen: React.FC<AssetScreenProps> = ({ projectId, kgId }) => {
  const smallScreen = useMediaQuery(768)

  return (
    <div className={styles.assetContainer}>
      {smallScreen ? (
        <AssetListMobile projectId={projectId} kgId={kgId} />
      ) : (
        <AssetList projectId={projectId} kgId={kgId} />
      )}
    </div>
  )
}

export default AssetScreen
