import { useCallback, FC, ChangeEvent, useEffect, useState } from "react";
import { Button } from "antd";
import { uploadFileApi } from "@/apis/assets";
import { CheckCircleFilled, ExclamationCircleFilled } from "@ant-design/icons";
type UploaderProps = {
  projectId: string;
  kgId: string;
  onSuccessCallback?: (...args: any[]) => void;
  onFailureCallback?: (...args: any[]) => void;
  beforeUploadFn?: (file: File) => boolean;
};

const Uploader: FC<UploaderProps> = ({
  projectId,
  kgId,
  onSuccessCallback,
  onFailureCallback,
  beforeUploadFn,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [file, setFile] = useState<File>();
  const [fileStatus, setFileStatus] = useState<
    "pending" | "success" | "failed"
  >("pending");

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.item(0);

      if (!file) return;
      const valid = beforeUploadFn ? beforeUploadFn(file) : true;
      if (!valid) return;
      setFile(file);
    },
    [setFile]
  );

  const handleStart = useCallback(async () => {
    if (file) {
      setLoading(true);
      try {
        const uploadId = await uploadFileApi(projectId, kgId, file);
        if (onSuccessCallback) onSuccessCallback(uploadId);
        setFileStatus("success");
      } catch {
        if (onFailureCallback) onFailureCallback();
        setFileStatus("failed");
      } finally {
        setLoading(false);
      }
    }
  }, [file]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1em",
      }}
    >
      <input
        type="file"
        className="customFileInput"
        onChange={handleChange}
        style={{ border: "none", background: "trasparent" }}
      />
      {fileStatus == "success" && <CheckCircleFilled />}
      {fileStatus == "failed" && <ExclamationCircleFilled />}
      <Button type="primary" onClick={handleStart} loading={loading}>
        {loading ? "Uploading" : "Start Upload"}
      </Button>
    </div>
  );
};

export default Uploader;
