import { Button } from "antd";
import { useState } from "react";
import { PlusCircleOutlined } from "@ant-design/icons";

import CreateAssetForm from "./createAsset";
import AssetList from "./assetList";

import styles from "./asset.module.scss";

type AssetScreenProps = {
  projectId: string;
  kgId: string;
};

const AssetScreen: React.FC<AssetScreenProps> = ({ projectId, kgId }) => {
  const [createAssetTab, setCreateAssetTab] = useState<boolean>(false);

  const handleAssetCreateButton = () => {
    setCreateAssetTab(true);
  };

  const closeAssetCreationForm = () => {
    setCreateAssetTab(false);
  };

  return (
    <div className={styles.assetContainer}>
      <div className={styles.assetScreenHeader}>
        {!createAssetTab && (
          <Button type="primary" onClick={handleAssetCreateButton}>
            <PlusCircleOutlined />
            Create new asset
          </Button>
        )}
      </div>
      {createAssetTab ? (
        <CreateAssetForm
          closeAssetCreationForm={closeAssetCreationForm}
          kgId={kgId}
          projectId={projectId}
        />
      ) : (
        <AssetList projectId={projectId} />
      )}
    </div>
  );
};

export default AssetScreen;
