import Loader from '@/components/Loader'
import SocketConnector from '@/components/Socket'
import { Layout } from 'antd'
import type { Metadata } from 'next'
import { useSession } from 'next-auth/react'
import Header from '../header'
import LoginScreen from '../login'
import Sider from '../sider'
import styles from './newlayout.module.scss'

export const metadata: Metadata = {
  title: 'Herald',
  description: 'Knowledge management system',
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession()

  if (status === 'loading') {
    return <Loader />
  }

  if (status === 'unauthenticated') {
    return <LoginScreen />
  }

  return (
    <Layout className={styles.layout}>
      <SocketConnector />
      <div className={styles.header}>
        <Header />
      </div>
      <div className={styles.content}>
        <div className={styles.sider}>
          <Sider />
        </div>
        <div className={styles.contentBody}>
          <div className={styles.mainBody}>{children}</div>
        </div>
      </div>
    </Layout>
  )
}
