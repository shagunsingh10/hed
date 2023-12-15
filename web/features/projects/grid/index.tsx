import { Project } from '@/types/projects'
import { Loader } from '@mantine/core'
import { FC } from 'react'
import ProjectCard from '../card'
import styles from './projectlist.module.scss'

type ProjectListProps = {
  projects: Project[]
  loading: boolean
}

const ProjectList: FC<ProjectListProps> = ({ projects, loading }) => {
  if (loading) {
    return <Loader size={30} />
  }

  return (
    <div className={styles.projectListContainer}>
      {projects.map((p) => (
        <ProjectCard project={p} />
      ))}
    </div>
  )
}

export default ProjectList
