import Loader from '@/components/Loader'
import useStore from '@/store'
import { Kg } from '@/types/kgs'
import {
  DownCircleOutlined,
  FileDoneOutlined,
  UpCircleOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Col, message, Row, Tabs } from 'antd'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import AssetScreen from '../../asset'
import KgUsers from '../kgUsers'
import styles from './kgDetails.module.scss'
import TabContent from './TabButton'

const KgDetailsScreen = () => {
  const { projectId, kgId }: { projectId: string; kgId: string } = useParams()
  const [kg, setkg] = useState<Kg>()
  const [loading, setLoading] = useState<boolean>(false)
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<number>(1)
  const getKgById = useStore((state) => state.getKgById)

  const tabs = [
    {
      title: 'Assets',
      icon: <FileDoneOutlined />,
      content: <AssetScreen projectId={projectId} kgId={kgId} />,
    },
    { title: 'Members', icon: <UserOutlined />, content: <KgUsers /> },
  ]

  const handleTabChange = (e: string) => {
    setActiveTab(Number(e))
  }

  useEffect(() => {
    setLoading(true)
    getKgById(projectId, kgId)
      .then((kg) => {
        setkg(kg)
        setLoading(false)
      })
      .catch(() => {
        message.error('Error in fetching kg!')
        setLoading(false)
      })
  }, [projectId, kgId])

  if (!projectId || !kgId || loading) {
    return <Loader />
  }

  return (
    <div className={styles.kgDetailsContainer}>
      <div className={styles.fullScreenToggle}>
        {isFullScreen ? (
          <DownCircleOutlined onClick={() => setIsFullScreen(false)} />
        ) : (
          <UpCircleOutlined onClick={() => setIsFullScreen(true)} />
        )}
      </div>
      <Row
        className={`${styles.kgDetailsHead} ${
          isFullScreen ? styles.hidden : ''
        }`}
      >
        <Col span={24}>
          <span className={styles.kgTitle}>{kg?.name}</span>
          <span className={styles.kgDescription}>{kg?.description}</span>
        </Col>
      </Row>
      <div
        className={`${styles.kgDetailsContent} ${
          isFullScreen ? styles.kgDetailsContentExpanded : ''
        }`}
      >
        <Tabs
          defaultActiveKey="1"
          type="card"
          onChange={handleTabChange}
          tabBarExtraContent={
            <TabContent
              activeTab={activeTab}
              projectId={projectId}
              kgId={kgId}
            />
          }
          tabBarGutter={10}
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

export default KgDetailsScreen
