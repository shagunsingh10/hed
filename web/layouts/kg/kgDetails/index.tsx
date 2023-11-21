import Loader from '@/components/Loader'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import CreateAssetForm from '@/layouts/asset/createAsset'
import useStore from '@/store'
import { Kg } from '@/types/kgs'
import {
  DownCircleOutlined,
  FileDoneOutlined,
  PlusCircleOutlined,
  UpCircleOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Col, message, Row, Tabs } from 'antd'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import AssetScreen from '../../asset'
import KgUsers from '../kgUsers'
import styles from './kgDetails.module.scss'

const KgDetailsScreen = () => {
  const smallScreen = useMediaQuery(768)
  const { projectId, kgId }: { projectId: string; kgId: string } = useParams()
  const [kg, setkg] = useState<Kg>()
  const [loading, setLoading] = useState<boolean>(false)
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false)
  const getKgById = useStore((state) => state.getKgById)

  const tabs = [
    {
      title: 'Assets',
      icon: <FileDoneOutlined />,
      content: <AssetScreen projectId={projectId} kgId={kgId} />,
    },
    {
      title: 'Add Asset',
      icon: <PlusCircleOutlined />,
      content: <CreateAssetForm projectId={projectId} kgId={kgId} />,
    },
    { title: 'Members', icon: <UserOutlined />, content: <KgUsers /> },
  ]

  useEffect(() => {
    setLoading(true)
    getKgById(projectId, kgId)
      .then((kg) => {
        setkg(kg)
        setLoading(false)
      })
      .catch((e) => {
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
        {/* <Col span={2} className={styles.kgAvatar}>
          <img
            src="/images/kg1.jpg"
            alt="project"
            height={70}
            width={70}
            style={{ borderRadius: "0.5em" }}
          />
        </Col> */}
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
          size={'small'}
          tabBarGutter={10}
          tabPosition={smallScreen ? 'top' : 'top'}
          tabBarStyle={{ marginRight: '0.5em' }}
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
