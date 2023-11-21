import Chatbox from '@/components/Chatbox'
import Loader from '@/components/Loader'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import useStore from '@/store'
import { Project } from '@/types/projects'
import {
  BookOutlined,
  DownCircleOutlined,
  MailOutlined,
  UpCircleOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Col, message, Row, Tabs } from 'antd'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
// import AssetScreen from '../../asset'
// import CreateAssetForm from '../../asset/createAsset'
import KGScreen from '../../kg'
import ProjectUsers from '../projectUsers'
import styles from './projectDetails.module.scss'
import TabContent from './TabButtons'

const ProjectDetailsScreen = () => {
  const smallScreen = useMediaQuery(768)
  const { projectId }: { projectId: string } = useParams()
  const getProjectById = useStore((state) => state.getProjectById)

  const [project, setProject] = useState<Project>()
  const [loading, setLoading] = useState<boolean>(false)
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<number>(1)

  const tabs = useMemo(
    () => [
      {
        title: 'Chat',
        icon: <MailOutlined />,
        content: <Chatbox scope="project" projectId={projectId} />,
      },
      {
        title: 'Knowledge Groups',
        icon: <BookOutlined />,
        content: <KGScreen projectId={projectId} />,
      },
      { title: 'Members', icon: <UserOutlined />, content: <ProjectUsers /> },
    ],
    [projectId, isFullScreen]
  )

  const handleTabChange = (e: string) => {
    setActiveTab(Number(e))
  }

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
      <div className={styles.fullScreenToggle}>
        {isFullScreen ? (
          <DownCircleOutlined onClick={() => setIsFullScreen(false)} />
        ) : (
          <UpCircleOutlined onClick={() => setIsFullScreen(true)} />
        )}
      </div>

      <Row
        className={`${styles.projectDetailsHead} ${
          isFullScreen ? styles.hidden : ''
        }`}
      >
        <Col span={24}>
          <span className={styles.projectTitle}>{project?.name} </span>
          <span className={styles.projectDescription}>
            {project?.description}
          </span>
        </Col>
      </Row>
      <div
        className={`${styles.projectDetailsContent} ${
          isFullScreen ? styles.projectDetailsContentExpanded : ''
        }`}
      >
        <Tabs
          defaultActiveKey="1"
          type="card"
          onChange={handleTabChange}
          tabBarGutter={10}
          tabBarExtraContent={
            <TabContent activeTab={activeTab} projectId={projectId} />
          }
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
