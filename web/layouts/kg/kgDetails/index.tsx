import Loader from '@/components/Loader'
import useStore from '@/store'
import { Kg } from '@/types/kgs'
import {
  FileDoneOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { message, Tabs } from 'antd'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import AssetScreen from '../../asset'
import KgSettings from '../kgSettings'
import KgUsers from '../kgUsers'
import styles from './kgDetails.module.scss'
import TabContent from './TabButton'

const KgDetailsScreen = () => {
  const { projectId, kgId }: { projectId: string; kgId: string } = useParams()
  const [kg, setkg] = useState<Kg>()
  const [loading, setLoading] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<number>(1)
  const getKgById = useStore((state) => state.getKgById)

  const tabs = [
    {
      title: 'Assets',
      icon: <FileDoneOutlined />,
      content: <AssetScreen projectId={projectId} kgId={kgId} />,
    },
    {
      title: 'Members',
      icon: <UserOutlined />,
      content: <KgUsers kgId={kgId} />,
    },
    {
      title: 'Settings',
      icon: <SettingOutlined />,
      content: <KgSettings kg={kg} />,
    },
  ]

  const handleTabChange = (e: string) => {
    setActiveTab(Number(e))
  }

  useEffect(() => {
    setLoading(true)
    getKgById(kgId)
      .then((kg) => {
        setkg(kg)
        setLoading(false)
      })
      .catch(() => {
        message.error('Error in fetching kg!')
        setLoading(false)
      })
  }, [kgId])

  if (!projectId || !kgId || loading) {
    return <Loader />
  }

  return (
    <div className={styles.kgDetailsContainer}>
      <div className={styles.kgDetailsHead}>
        <span className={styles.kgTitle}>{kg?.name}</span>
      </div>
      <div className={styles.kgDetailsContent}>
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
