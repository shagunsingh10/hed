import { useDebouncedCallback } from '@/hooks/useDebounceCallback'
import useStore from '@/store'
import { Project } from '@/types/projects'
import { Input } from 'antd'
import { useEffect, useState } from 'react'
import ProjectsGrid from './projectGrid'
import styles from './projects.module.scss'

const { Search } = Input

const ProjectsScreen = () => {
  const [loading, setLoading] = useState(false)
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const projects = useStore((state) => state.projects)
  const getProjects = useStore((state) => state.getProjects)

  useEffect(() => {
    if (getProjects) {
      setLoading(true)
      getProjects().then(() => setLoading(false))
    }
  }, [getProjects])

  useEffect(() => setFilteredProjects(projects), [projects])

  const onChange = useDebouncedCallback((text: string) => {
    setFilteredProjects(
      projects.filter(
        (e) =>
          e.name.toLocaleLowerCase().includes(text.toLocaleLowerCase()) ||
          e.tags
            .toString()
            .toLocaleLowerCase()
            .includes(text.toLocaleLowerCase()) ||
          e.description?.toLocaleLowerCase().includes(text.toLocaleLowerCase())
      )
    )
  }, 100)

  return (
    <div className={styles.projectsContainer}>
      <div className={styles.screenHeader}>
        <div className={styles.screenTitle}>Projects</div>
        <Search
          className={styles.search}
          placeholder="Search projects by name or tags or description"
          size="large"
          onChange={(e) => onChange(e.target.value)}
        />
      </div>

      <ProjectsGrid projects={filteredProjects} loading={loading} />
    </div>
  )
}

export default ProjectsScreen
