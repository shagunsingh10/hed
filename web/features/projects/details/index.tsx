import { getProjectByIdApi } from '@/apis/projects'
import OverlayLoader from '@/components/Loader'
import Assets from '@/features/asset'
import useStore from '@/store'
import { Tabs, Title } from '@mantine/core'
import { showNotification } from '@mantine/notifications'
import {
  IconCube,
  IconSettings,
  IconUsersGroup,
  IconWhirl,
} from '@tabler/icons-react'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import ProjectAdmins from '../admins'
import ProjectSettings from '../settings'
import styles from './details.module.scss'

const ProjectDetailsScreen = () => {
  const params: { projectId: string } = useParams()
  const projectId = params?.projectId
  const project = useStore((state) => state.selectedprojectDetails)
  const setProject = useStore((state) => state.setSelectedProjectDetails)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    if (!projectId) return
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
    <OverlayLoader />
  ) : (
    <div className={styles.projectDetailsContainer}>
      <div className={styles.title}>
        <IconWhirl size={23} />
        <Title order={4}>{project?.name}</Title>
      </div>
      <Tabs defaultValue="assets" className={styles.content}>
        <Tabs.List>
          <Tabs.Tab
            value="assets"
            className={styles.navItem}
            leftSection={<IconCube size={15} />}
          >
            Assets
          </Tabs.Tab>
          <Tabs.Tab
            value="admins"
            className={styles.navItem}
            leftSection={<IconUsersGroup size={15} />}
          >
            Admins
          </Tabs.Tab>
          <Tabs.Tab
            value="settings"
            className={styles.navItem}
            leftSection={<IconSettings size={15} />}
          >
            Settings
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="assets" className={styles.tabContent}>
          <Assets projectId={projectId} />
        </Tabs.Panel>
        <Tabs.Panel value="admins" className={styles.tabContent}>
          <ProjectAdmins projectId={projectId} />
        </Tabs.Panel>
        <Tabs.Panel value="settings" className={styles.tabContent}>
          <ProjectSettings project={project} />
        </Tabs.Panel>
      </Tabs>
    </div>
  )
}

export default ProjectDetailsScreen
