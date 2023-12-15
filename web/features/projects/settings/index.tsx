import { Project } from '@/types/projects'
import { Badge, Stack, Text, Title } from '@mantine/core'
import { FC } from 'react'

type IProjectSettings = {
  project: Project | null
}
const ProjectSettings: FC<IProjectSettings> = ({ project }) => {
  return project ? (
    <Stack>
      <Title order={3}>{project.name}</Title>
      <strong>Description:</strong>
      <Text size="xs">{project.description}</Text>
      <strong>Tags:</strong>
      {project.tags.map((tag: string) => (
        <Badge key={tag} variant="light">
          {tag}
        </Badge>
      ))}
    </Stack>
  ) : (
    <></>
  )
}

export default ProjectSettings
