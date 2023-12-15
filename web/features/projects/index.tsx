import { getProjectsApi } from '@/apis/projects'
import { useDebouncedCallback } from '@/hooks/useDebounceCallback'
import useStore from '@/store'
import { Project } from '@/types/projects'
import { Button, Input, Title } from '@mantine/core'
import { showNotification } from '@mantine/notifications'
import {
  IconPackageExport,
  IconPackages,
  IconSearch,
} from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import CreateProjectForm from './create-form'
import ProjectsList from './grid'
import styles from './projects.module.scss'

const ProjectsScreen = () => {
  const [loading, setLoading] = useState(false)
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [createProjectTab, setCreateProjectTab] = useState<boolean>(false)

  const projects = useStore((state) => state.projects)
  const setProjects = useStore((state) => state.setProjects)

  useEffect(() => {
    setLoading(true)
    getProjectsApi()
      .then((projects) => {
        setProjects(projects)
      })
      .catch(() => {
        showNotification({
          message: 'Some error occurred in fetching projects',
          color: 'red',
        })
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

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
    <div className={styles.pageContainer}>
      <div className={styles.mainContainer}>
        <div className={styles.screenHeader}>
          <Title order={3} size="md" className={styles.pageTitle}>
            <IconPackages size={20} />
            My Projects
          </Title>
          <Button
            onClick={() => setCreateProjectTab(true)}
            size="xs"
            leftSection={<IconPackageExport size={17} />}
          >
            Create New
          </Button>
        </div>
        <div className={styles.projectsContainer}>
          <Input
            width={'100%'}
            size="sm"
            rightSection={<IconSearch size={17} />}
            className={styles.search}
            placeholder="Search projects by name or tags or description"
            onChange={(e) => onChange(e.target.value)}
          />
          <div className={styles.projectTable}>
            <ProjectsList projects={filteredProjects} loading={loading} />
          </div>
        </div>
      </div>
      <CreateProjectForm
        open={createProjectTab}
        closeProjectCreationForm={() => setCreateProjectTab(false)}
      />
    </div>
  )
}

export default ProjectsScreen
