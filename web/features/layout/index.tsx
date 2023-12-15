import { getUserByEmail } from '@/apis/users'
import SocketConnector from '@/components/Socket'
import { User } from '@/types/users'
import { Loader } from '@mantine/core'
import type { Metadata } from 'next'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import Header from '../header'
import LoginScreen from '../login'
import Sider from '../sider'
import styles from './newlayout.module.scss'

export const metadata: Metadata = {
  title: 'Herald',
  description: 'Knowledge management system',
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (session?.user?.email) {
      getUserByEmail(session?.user?.email)
        .then((user: User) => {
          localStorage.setItem('userAvatarSrc', user?.image || '')
        })
        .catch((e) => console.error(e))
    }
  }, [session])

  if (status === 'loading') {
    return <Loader />
  }

  if (status === 'unauthenticated') {
    return <LoginScreen />
  }

  return (
    <div className={styles.layout}>
      <SocketConnector />
      <div className={styles.content}>
        <div className={styles.sider}>
          <Sider />
        </div>
        <div className={styles.contentBody}>
          <div className={styles.header}>
            <Header />
          </div>
          <div className={styles.mainBody}>{children}</div>
        </div>
      </div>
    </div>
  )
}
