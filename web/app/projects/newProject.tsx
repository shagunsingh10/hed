import { useState } from "react";
import { Form, Input, Button, Card, message } from "antd";

import styles from "./projects.module.scss";
import useStore from "store";

type createProjectFormProps = {
  closeProjectCreationForm: () => void;
};

const CreateProjectForm: React.FC<createProjectFormProps> = ({
  closeProjectCreationForm,
}) => {
  const [loading, setLoading] = useState(false);
  const createProject = useStore((state) => state.createProject);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      createProject({
        name: values.projectName,
        description: values.projectDescription,
        tags: values.projectTags,
      });
      console.log("ss");
      message.success("Project Created Successfully");
      closeProjectCreationForm();
    } catch (e: any) {
      message.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={styles.newProjectFormContainer}>
      <Form
        onFinish={handleSubmit}
        onReset={closeProjectCreationForm}
        layout="vertical"
      >
        <div className={styles.form}>
          <Form.Item
            label="Project Name"
            name="projectName"
            rules={[
              { required: true, message: "Please enter the project name" },
            ]}
          >
            <Input placeholder="Enter project name" />
          </Form.Item>

          <Form.Item
            label="Project Description"
            name="projectDescription"
            rules={[
              {
                required: true,
                message: "Please enter the project description",
              },
            ]}
          >
            <Input.TextArea rows={6} placeholder="Enter project description" />
          </Form.Item>

          <Form.Item label="Project Tags" name="projectTags">
            <Input placeholder="Enter project tags (comma-separated)" />
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

export default CreateProjectForm;
