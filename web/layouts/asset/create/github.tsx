import { Form, Input } from "antd";

function extractUserAndRepo(githubUrl: string) {
  const regex = /github\.com\/([^\/]+)\/([^\/]+)(\/|$)/;
  const match = githubUrl.match(regex);

  if (match && match.length === 3) {
    const username = match[1];
    const repo = match[2];
    return { username, repo };
  } else {
    return null; // Invalid GitHub URL
  }
}

const GithubForm = () => {
  return (
    <div>
      <Form.Item
        label="Github Repo"
        name="repo"
        rules={[
          {
            required: true,
            message: "Please enter the github repo link.",
          },
        ]}
      >
        <Input placeholder="Github repo link is required" />
      </Form.Item>
      <Form.Item
        label="Github Token"
        name="token"
        rules={[
          {
            required: true,
            message: "Please enter your github token.",
          },
        ]}
      >
        <Input placeholder="Github pat token is required" />
      </Form.Item>
    </div>
  );
};

export default GithubForm;
