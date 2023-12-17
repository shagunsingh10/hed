import OverlayLoader from '@/components/Loader'
import { Project } from '@/types/projects'
import { Stack, Title } from '@mantine/core'
import { IconDatabaseOff } from '@tabler/icons-react'
import { FC } from 'react'
import ProjectCard from '../card'
import styles from './projectlist.module.scss'

type ProjectListProps = {
  projects: Project[]
  loading: boolean
}

const ProjectList: FC<ProjectListProps> = ({ projects, loading }) => {
  if (loading) {
    return <OverlayLoader />
  }

  return (
    <div className={styles.projectListContainer}>
      {projects.map((p) => (
        <ProjectCard project={p} />
      ))}
      {projects.length === 0 && (
        <Stack align="center" justify="center" gap="lg" w="90vw">
          <IconDatabaseOff size={50} opacity={0.4} />
          <Title order={3} opacity={0.4}>
            No Projects
          </Title>
        </Stack>
      )}
    </div>
  )
}

export default ProjectList
