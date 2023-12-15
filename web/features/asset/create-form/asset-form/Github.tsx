import { TextInput } from '@mantine/core'
import { UseFormReturnType } from '@mantine/form'
import { FC } from 'react'

function extractUserAndRepo(githubUrl: string) {
  // eslint-disable-next-line no-useless-escape
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

type GithubFormProps = {
  form: UseFormReturnType<any>
}

const GithubForm: FC<GithubFormProps> = ({ form }) => {
  return (
    <>
      <TextInput
        size="xs"
        mb="md"
        withAsterisk
        label="Github Repo Link"
        placeholder="Github repo link is required"
        {...form.getInputProps('githubUrl')}
      />

      <TextInput
        size="xs"
        mb="md"
        withAsterisk
        label="Branch"
        placeholder="Enter branch name"
        defaultValue={'main'}
        {...form.getInputProps('branch')}
      />

      <TextInput
        size="xs"
        mb="md"
        withAsterisk
        label="Github Pat Token"
        placeholder="Github pat token is required"
        {...form.getInputProps('githubToken')}
      />
    </>
  )
}

export default GithubForm

export { extractUserAndRepo }
