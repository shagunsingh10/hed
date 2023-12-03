import { getProjectByIdApi } from '@/apis/projects'
import Loader from '@/components/Loader'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import useStore from '@/store'
import { BookOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons'
import { message, Tabs } from 'antd'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import KGScreen from '../../kg'
import ProjectAdmins from '../projectAdmins'
import ProjectSettings from '../projectSettings'
import styles from './projectDetails.module.scss'

const ProjectDetailsScreen = () => {
  const smallScreen = useMediaQuery(768)
  const { projectId }: { projectId: string } = useParams()
  const project = useStore((state) => state.selectedprojectDetails)
  const setProject = useStore((state) => state.setSelectedProjectDetails)
  const [loading, setLoading] = useState<boolean>(false)

  const tabs = useMemo(
    () => [
      {
        title: 'Knowledge Groups',
        icon: <BookOutlined />,
        content: <KGScreen projectId={projectId} />,
      },
      {
        title: 'Admins',
        icon: <UserOutlined />,
        content: <ProjectAdmins projectId={projectId} />,
      },
      {
        title: 'Settings',
        icon: <SettingOutlined />,
        content: <ProjectSettings project={project} />,
      },
    ],
    [projectId, project]
  )

  useEffect(() => {
    setLoading(true)
    getProjectByIdApi(projectId)
      .then((project) => {
        setProject(project)
      })
      .catch(() => {
        message.error('Error in fetching project!')
      })
      .finally(() => setLoading(false))
  }, [projectId])

  return !projectId || loading ? (
    <Loader />
  ) : (
    <div className={styles.projectDetailsContainer}>
      <div className={styles.projectDetailsHead}>
        <span className={styles.projectTitle}>
          <img src="/icons/project.svg" width={25} height={25} />
          {project?.name}
        </span>
      </div>
      <div className={styles.projectDetailsContent}>
        <Tabs
          defaultActiveKey="1"
          type="card"
          tabBarGutter={10}
          tabPosition={smallScreen ? 'top' : 'top'}
          items={tabs.map((tab, i) => {
            return {
              label: (
                <span>
                  {tab.icon}
                  {tab.title}
                </span>
              ),
              key: String(i + 1),
              children: tab.content,
            }
          })}
        />
      </div>
    </div>
  )
}

export default ProjectDetailsScreen
