import { Button } from "antd";
import { useState } from "react";
import { PlusCircleOutlined } from "@ant-design/icons";

import CreateKgForm from "./createKg";
import KgList from "./kgList";

import styles from "./kg.module.scss";

type KGScreenProps = {
  projectId: string;
};

const KGScreen: React.FC<KGScreenProps> = ({ projectId }) => {
  const [createKgTab, setCreateKgTab] = useState<boolean>(false);

  const handleKgCreateButton = () => {
    setCreateKgTab(true);
  };

  const closeKgCreationForm = () => {
    setCreateKgTab(false);
  };

  return (
    <div className={styles.kgContainer}>
      <div className={styles.screenHeader}>
        {!createKgTab && (
          <Button type="primary" onClick={handleKgCreateButton}>
            <PlusCircleOutlined />
            Create Knowledge Group
          </Button>
        )}
      </div>
      {createKgTab ? (
        <CreateKgForm
          closeKgCreationForm={closeKgCreationForm}
          projectId={projectId}
        />
      ) : (
        <KgList projectId={projectId} />
      )}
    </div>
  );
};

export default KGScreen;
