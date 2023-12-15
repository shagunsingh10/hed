import { getProjectByIdApi } from '@/apis/projects'
import useStore from '@/store'
import { Divider, Loader, NavLink, Title } from '@mantine/core'
import { showNotification } from '@mantine/notifications'
import {
  IconHexagonalPrism,
  IconPackage,
  IconSettings,
  IconUser,
} from '@tabler/icons-react'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import KGScreen from '../../kg'
import ProjectAdmins from '../admins'
import ProjectSettings from '../settings'
import styles from './details.module.scss'

const ProjectDetailsScreen = () => {
  const { projectId }: { projectId: string } = useParams()
  const project = useStore((state) => state.selectedprojectDetails)
  const setProject = useStore((state) => state.setSelectedProjectDetails)
  const [loading, setLoading] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<number>(1)

  useEffect(() => {
    setLoading(true)
    getProjectByIdApi(projectId)
      .then((project) => {
        setProject(project)
      })
      .catch(() => {
        showNotification({
          color: 'red',
          message: 'Error in fetching project!',
        })
      })
      .finally(() => setLoading(false))
  }, [projectId])

  return !projectId || loading ? (
    <Loader />
  ) : (
    <div className={styles.projectDetailsContainer}>
      <div className={styles.title}>
        <IconPackage size={23} />
        <Title order={4}>{project?.name}</Title>
      </div>
      <Divider size="xs" />
      <div className={styles.content}>
        <div className={styles.menuContent}>
          <NavLink
            className={styles.navItem}
            leftSection={<IconHexagonalPrism size={15} />}
            label="Knowledge Groups"
            active={activeTab == 1}
            onClick={() => setActiveTab(1)}
          />
          <NavLink
            className={styles.navItem}
            leftSection={<IconUser size={15} />}
            label="Admins"
            active={activeTab == 2}
            onClick={() => setActiveTab(2)}
          />
          <NavLink
            className={styles.navItem}
            leftSection={<IconSettings size={15} />}
            label="Settings"
            active={activeTab == 3}
            onClick={() => setActiveTab(3)}
          />
        </div>
        <Divider size="xs" orientation="vertical" />
        <div className={styles.tabContent}>
          {activeTab == 1 && <KGScreen projectId={projectId} />}
          {activeTab == 2 && <ProjectAdmins projectId={projectId} />}
          {activeTab == 3 && <ProjectSettings project={project} />}
        </div>
      </div>
    </div>
  )
}

export default ProjectDetailsScreen
