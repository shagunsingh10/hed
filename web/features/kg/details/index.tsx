import { getKgByIdApi } from '@/apis/kgs'
import { Kg } from '@/types/kgs'
import { Divider, Loader, NavLink, Title } from '@mantine/core'
import { showNotification } from '@mantine/notifications'
import {
  IconCube,
  IconHexagonalPrism,
  IconSettings,
  IconUser,
} from '@tabler/icons-react'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import AssetScreen from '../../asset'
import KgMembers from '../members'
import KgSettings from '../settings'
import styles from './kgDetails.module.scss'

const ProjectDetailsScreen = () => {
  const { projectId, kgId }: { projectId: string; kgId: string } = useParams()
  const [kg, setkg] = useState<Kg>()
  const [loading, setLoading] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<number>(1)

  useEffect(() => {
    setLoading(true)
    getKgByIdApi(kgId)
      .then((kg) => {
        setkg(kg)
        setLoading(false)
      })
      .catch(() => {
        showNotification({ message: 'Error in fetching kg!', color: 'red' })
        setLoading(false)
      })
  }, [kgId])

  return !projectId || loading ? (
    <Loader />
  ) : (
    <div className={styles.kgDetailsContainer}>
      <div className={styles.title}>
        <IconHexagonalPrism size={23} />
        <Title order={4}>{kg?.name}</Title>
      </div>
      <Divider size="xs" />
      <div className={styles.content}>
        <div className={styles.menuContent}>
          <NavLink
            className={styles.navItem}
            leftSection={<IconCube size={15} />}
            label="Assets"
            active={activeTab == 1}
            onClick={() => setActiveTab(1)}
          />
          <NavLink
            className={styles.navItem}
            leftSection={<IconUser size={15} />}
            label="Members"
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
          {activeTab == 1 && <AssetScreen projectId={projectId} kgId={kgId} />}
          {activeTab == 2 && <KgMembers kgId={kgId} />}
          {activeTab == 3 && <KgSettings kg={kg} />}
        </div>
      </div>
    </div>
  )
}

export default ProjectDetailsScreen
