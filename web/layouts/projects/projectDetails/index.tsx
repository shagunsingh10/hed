import Chatbox from '@/components/Chatbox'
import Loader from '@/components/Loader'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import useStore from '@/store'
import { Project } from '@/types/projects'
import {
  BookOutlined,
  MailOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { message, Tabs } from 'antd'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
// import AssetScreen from '../../asset'
// import CreateAssetForm from '../../asset/createAsset'
import KGScreen from '../../kg'
import ProjectSettings from '../projectSettings'
import ProjectUsers from '../projectUsers'
import styles from './projectDetails.module.scss'

const ProjectDetailsScreen = () => {
  const smallScreen = useMediaQuery(768)
  const { projectId }: { projectId: string } = useParams()
  const getProjectById = useStore((state) => state.getProjectById)

  const [project, setProject] = useState<Project>()
  const [loading, setLoading] = useState<boolean>(false)

  const tabs = useMemo(
    () => [
      {
        title: 'Chat',
        icon: <MailOutlined />,
        content: <Chatbox projectId={projectId} />,
      },
      {
        title: 'Knowledge Groups',
        icon: <BookOutlined />,
        content: <KGScreen projectId={projectId} />,
      },
      { title: 'Members', icon: <UserOutlined />, content: <ProjectUsers /> },
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
    getProjectById(projectId)
      .then((project) => {
        setProject(project)
        setLoading(false)
      })
      .catch(() => {
        message.error('Error in fetching project!')
        setLoading(false)
      })
  }, [projectId])

  return !projectId || loading ? (
    <Loader />
  ) : (
    <div className={styles.projectDetailsContainer}>
      <div className={styles.projectDetailsHead}>
        <span className={styles.projectTitle}>{project?.name} </span>
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
