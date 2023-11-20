import { Form, Input } from "antd";

const WikipediaForm = () => {
  return (
    <div>
      <Form.Item
        label="Wikipedia Pages"
        name="wiki_page"
        rules={[
          {
            required: true,
            message: "Please enter the wikipedia page.",
          },
        ]}
      >
        <Input placeholder="Wikipedia page name is required" />
      </Form.Item>
    </div>
  );
};

export default WikipediaForm;
