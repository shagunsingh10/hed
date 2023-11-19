import AssetList from "./assetList";
import styles from "./asset.module.scss";

type AssetScreenProps = {
  projectId: string;
  kgId?: string;
};

const AssetScreen: React.FC<AssetScreenProps> = ({ projectId, kgId }) => {
  return (
    <div className={styles.assetContainer}>
      <AssetList projectId={projectId} kgId={kgId} />
    </div>
  );
};

export default AssetScreen;
