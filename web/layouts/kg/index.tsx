import KgList from "./kgList";
import styles from "./kg.module.scss";

type KGScreenProps = {
  projectId: string;
};

const KGScreen: React.FC<KGScreenProps> = ({ projectId }) => {
  return (
    <div className={styles.kgContainer}>
      <KgList projectId={projectId} />
    </div>
  );
};

export default KGScreen;
