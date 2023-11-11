import { useState, FC } from "react";
import { Form, Input, Button, Card, message } from "antd";

import styles from "./kg.module.scss";
import useStore from "@/store";

type createKgFormProps = {
  projectId: string;
  closeKgCreationForm: () => void;
};

const CreateKGForm: FC<createKgFormProps> = ({
  projectId,
  closeKgCreationForm,
}) => {
  const [loading, setLoading] = useState(false);
  const createKg = useStore((state) => state.createKg);

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

      closeKgCreationForm();
    } catch (e: any) {
      message.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={styles.newKGFormContainer}>
      <Form
        onFinish={handleSubmit}
        onReset={closeKgCreationForm}
        layout="vertical"
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
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Submit
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CreateKGForm;
