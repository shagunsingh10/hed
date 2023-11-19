import { useState, FC, useEffect, useRef } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Select,
  Row,
  Col,
  Typography,
} from "antd";
import Uploader from "@/components/Uploader";

import styles from "./asset.module.scss";
import useStore from "@/store";
import Loader from "@/components/Loader";
import GithubForm from "./create/github";

const { Option } = Select;

type CreateAssetFormProps = {
  projectId: string;
  kgId?: string;
};

const CreateAssetForm: FC<CreateAssetFormProps> = ({ projectId, kgId }) => {
  const [loading, setLoading] = useState(false);
  const [selecTedAssetType, setSelectedAssetType] = useState<string>("");
  const [uploadId, setUploadId] = useState<string>();
  const [selectedKgId, setSelectedKgId] = useState<string>();
  const formRef: any = useRef(null);

  const createAsset = useStore((state) => state.createAsset);
  const assetTypes = useStore((state) => state.assetTypes);
  const kgs = useStore((state) => state.kgs);
  const getKgs = useStore((state) => state.getKgs);

  const handleSubmit = async (values: any) => {
    const assetType = assetTypes.find((e) => e.key === selecTedAssetType);
    if (!selectedKgId || !assetType) return;

    setLoading(true);
    try {
      createAsset(projectId, selectedKgId, {
        assetTypeId: assetType.id,
        knowledgeGroupId: selectedKgId,
        name: values.name,
        description: values.description,
        tags: values.tags,
        uploadId: uploadId,
      });
      message.info("Asset created and sent for ingestion");
    } catch (e: any) {
      message.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    formRef.current?.resetFields();
  };

  const handleUploadComplete = (uploadId: string) => {
    setUploadId(uploadId);
  };

  const handleUploadFailure = () => {
    message.error("Upload failed! Please try again.");
  };

  useEffect(() => {
    if (getKgs) getKgs(projectId);
  }, [getKgs]);

  // if kg id comes from props, set it automatically
  useEffect(() => {
    if (kgId) setSelectedKgId(kgId);
  }, [kgId]);

  if (!assetTypes || assetTypes.length === 0) {
    return <Loader />;
  }

  return (
    <Card className={styles.newKGFormContainer}>
      <Form
        onFinish={handleSubmit}
        onReset={handleReset}
        layout="vertical"
        ref={formRef}
      >
        <div className={styles.formItemsContainer}>
          <Row>
            <Col span={11}>
              <Typography.Title level={3}>Asset</Typography.Title>
              {!kgId && (
                <Form.Item
                  label="Knowledge Group"
                  name="kgId"
                  rules={[
                    {
                      required: true,
                      message: "Please select knowledge group.",
                    },
                  ]}
                >
                  <Select
                    showSearch={true}
                    onChange={(e) => setSelectedKgId(e)}
                  >
                    {kgs.map((e) => (
                      <Option key={e.id} value={e.id}>
                        {e.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              )}
              <Form.Item
                label="Asset Type"
                name="assetType"
                rules={[
                  {
                    required: true,
                    message: "Please select assetType.",
                  },
                ]}
              >
                <Select
                  showSearch={true}
                  onChange={(e) => setSelectedAssetType(e)}
                >
                  {assetTypes.map((e) => (
                    <Option key={e.id} value={e.key}>
                      {e.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              {selecTedAssetType && selectedKgId && (
                <>
                  {selecTedAssetType === "directory" && (
                    <Uploader
                      projectId={projectId}
                      kgId={selectedKgId}
                      onSuccessCallback={handleUploadComplete}
                      onFailureCallback={handleUploadFailure}
                    />
                  )}
                  {selecTedAssetType === "github" && <GithubForm />}
                  {selecTedAssetType !== "github" &&
                    selecTedAssetType !== "directory" && (
                      <span>Coming Soon!</span>
                    )}
                </>
              )}
            </Col>
            <Col span={2} />
            <Col span={11}>
              <Typography.Title level={3}>Metadata</Typography.Title>
              <Form.Item
                label="Name"
                name="name"
                rules={[
                  {
                    required: true,
                    message: "Please enter a name for this asset.",
                  },
                ]}
              >
                <Input placeholder="Name is required" />
              </Form.Item>

              <Form.Item label="Asset Description" name="description">
                <Input.TextArea
                  rows={6}
                  placeholder="Please enter a short description for this KG"
                />
              </Form.Item>
              <Form.Item label="Tags" name="tags">
                <Input placeholder="Enter tags asscoiated with this asset (comma-separated)" />
              </Form.Item>
              <Form.Item label="Authors" name="poc">
                <Select
                  showSearch={true}
                  placeholder="Select authors of this asset"
                  mode="multiple"
                >
                  {[
                    { id: "Bob@abc.com", name: "Bob@abc.com" },
                    { id: "Sam@abc.com", name: "Sam@abc.com" },
                    { id: "Shivam@abc.com", name: "Shivam@abc.com" },
                  ].map((e) => (
                    <Option key={e.id} value={e.id}>
                      {e.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </div>
        <Form.Item>
          <div className={styles.formButtonGroup}>
            <Button color="secondary" htmlType="reset" loading={loading}>
              Reset
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={selecTedAssetType === "directory" && !uploadId}
            >
              Add
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CreateAssetForm;
