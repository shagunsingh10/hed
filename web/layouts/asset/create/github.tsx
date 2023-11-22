import { Form, Input } from 'antd'

function extractUserAndRepo(githubUrl: string) {
  const regex = /github\.com\/([^\/]+)\/([^\/]+)(\/|$)/
  const match = githubUrl.match(regex)
  if (match && match.length >= 3) {
    const owner = match[1]
    const repo = match[2]
    return { owner, repo }
  } else {
    return {} // Invalid GitHub URL
  }
}

const GithubForm = () => {
  return (
    <div>
      <Form.Item
        label="Github Repo Link"
        name="github_url"
        rules={[
          {
            required: true,
            message: 'Please enter the github repo link.',
          },
        ]}
      >
        <Input placeholder="Github repo link is required" />
      </Form.Item>
      <Form.Item
        label="Github Token"
        name="github_token"
        rules={[
          {
            required: true,
            message: 'Please enter your github token.',
          },
        ]}
      >
        <Input placeholder="Github pat token is required" />
      </Form.Item>
    </div>
  )
}

export default GithubForm

export { extractUserAndRepo }
