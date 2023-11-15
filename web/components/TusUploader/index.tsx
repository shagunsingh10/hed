import { useTus } from "use-tus";
import { useCallback, FC, ChangeEvent, useEffect, useState } from "react";
import { Button, message } from "antd";
import { removeItem } from "@/lib/tusd";

type TusUploaderProps = {
  onSuccessCallback?: (...args: any[]) => void;
  onSuccessCallbackArgs?: any[];
  onFailureCallback?: (...args: any[]) => void;
  onFailureCallbackArgs?: any[];
  beforeUploadFn?: (file: File) => boolean;
};

const TusUploader: FC<TusUploaderProps> = ({
  onSuccessCallback,
  onSuccessCallbackArgs,
  onFailureCallback,
  onFailureCallbackArgs,
  beforeUploadFn,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { upload, setUpload, isSuccess, error, remove, isAborted } = useTus();

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.item(0);

      if (!file) return;
      const valid = beforeUploadFn ? beforeUploadFn(file) : true;
      if (!valid) return;
      setUpload(file, {
        endpoint: "/api/tus-upload/files",
        metadata: {
          filename: file.name,
          filetype: file.type,
        },
      });
    },
    [setUpload]
  );

  const handleStart = useCallback(() => {
    if (!upload) {
      return;
    }
    setLoading(true);
    upload.start();
  }, [upload]);

  useEffect(() => {
    if (isSuccess) {
      setLoading(false);
      if (onSuccessCallback)
        onSuccessCallback(...(onSuccessCallbackArgs || []));
    }
    if (error || isAborted) {
      // removeItem();
      setLoading(false);
      if (onFailureCallback)
        onFailureCallback(...(onFailureCallbackArgs || []));
    }
  }, [isSuccess, error, isAborted, upload]);

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
      <Button type="primary" onClick={handleStart} loading={loading}>
        {loading ? "Uploading" : "Start Upload"}
      </Button>
    </div>
  );
};

export default TusUploader;
