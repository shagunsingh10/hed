import { useState, FC, useRef } from "react";
import { Form, Input, Button, Card, message, Modal, Typography } from "antd";

import styles from "./kg.module.scss";
import useStore from "@/store";

type createKgFormProps = {
  projectId: string;
};

const CreateKGForm: FC<createKgFormProps> = ({ projectId }) => {
  const [loading, setLoading] = useState(false);
  const createKg = useStore((state) => state.createKg);
  const formRef: any = useRef(null);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      createKg(projectId, {
        projectId: projectId,
        name: values.name,
        description: values.description,
        tags: values.tags,
      });
      message.success("Knowledge Created Successfully");
    } catch (e: any) {
      message.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    formRef.current?.resetFields();
  };

  return (
    <Card className={styles.newKGFormContainer}>
      <Typography.Title level={3}>
        Create a new knowledge group
      </Typography.Title>
      <Form
        onFinish={handleSubmit}
        onReset={handleReset}
        layout="vertical"
        ref={formRef}
      >
        <div className={styles.formItemsContainer}>
          <Form.Item
            label="Name"
            name="name"
            rules={[
              {
                required: true,
                message: "Please enter a name for this knowledge group.",
              },
            ]}
          >
            <Input placeholder="Name is required" />
          </Form.Item>

          <Form.Item label="KG Description" name="description">
            <Input.TextArea
              rows={6}
              placeholder="Please enter a short description for this KG"
            />
          </Form.Item>

          <Form.Item label="Tags" name="tags">
            <Input placeholder="Enter tags asscoiated with this knowledge group (comma-separated)" />
          </Form.Item>
        </div>
        <Form.Item>
          <div className={styles.formButtonGroup}>
            <Button color="secondary" htmlType="reset" loading={loading}>
              Reset
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Create
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CreateKGForm;
