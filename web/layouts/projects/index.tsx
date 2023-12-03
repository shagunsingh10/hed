import { getProjectsApi } from '@/apis/projects'
import { useDebouncedCallback } from '@/hooks/useDebounceCallback'
import useStore from '@/store'
import { Project } from '@/types/projects'
import { PlusCircleOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Input, message, Typography } from 'antd'
import { useEffect, useState } from 'react'
import ProjectEvents from './events'
import AppMetrics from './metrics'
import CreateProjectForm from './newProjectForm/newProject'
import ProjectsGrid from './projectGrid'
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
        message.error('Some error occurred in fetching projects')
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
      <Typography.Title level={3} className={styles.pageTitle}>
        <img src="/icons/project.svg" width={25} height={25} />
        My Projects
      </Typography.Title>
      <div className={styles.projectsScreen}>
        <div className={styles.projectsContainer}>
          <div className={styles.screenHeader}>
            <Input
              prefix={<SearchOutlined />}
              className={styles.search}
              placeholder="Search projects by name or tags or description"
              onChange={(e) => onChange(e.target.value)}
            />
            <Button onClick={() => setCreateProjectTab(true)} type="primary">
              <PlusCircleOutlined /> Create New
            </Button>
          </div>

          <ProjectsGrid projects={filteredProjects} loading={loading} />
          <CreateProjectForm
            open={createProjectTab}
            closeProjectCreationForm={() => setCreateProjectTab(false)}
          />
        </div>
        <div className={styles.rightContainer}>
          <div className={styles.appMetricsContainer}>
            <Typography.Title level={3} className={styles.eventsTitle}>
              Metrics
            </Typography.Title>
            <AppMetrics />
          </div>
          <div className={styles.eventsContainer}>
            <Typography.Title level={3} className={styles.eventsTitle}>
              Recent Events
            </Typography.Title>
            <ProjectEvents />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectsScreen
