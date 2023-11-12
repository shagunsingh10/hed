import useStore from "@/store";
import { message } from "antd";
import { useEffect } from "react";

const AssetStatusUpdater = ({
  assetId,
  status,
}: {
  assetId: string;
  status: string;
}) => {
  const updateAssetStatus = useStore((state) => state.updateAssetStatus);

  useEffect(() => {
    if (status) {
      if (status === "success") {
        message.success("Asset imported successfully!");
      } else if (status === "failed") {
        message.error("Asset import failed!");
      } else {
        return;
      }

      updateAssetStatus(assetId, status);
    }
  }, [assetId, status]);

  return null;
};

export default AssetStatusUpdater;
