import { getAssetsToReviewCountApi } from '@/apis/assets'
import useStore from '@/store'
import {
  AppstoreFilled,
  BulbFilled,
  CheckSquareFilled,
  LogoutOutlined,
  SettingFilled,
} from '@ant-design/icons'
import { Avatar, Badge, Dropdown, type MenuProps } from 'antd'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import styles from './sider.module.scss'

const userMenuItems: MenuProps['items'] = [
  {
    key: 'logout',
    icon: <LogoutOutlined />,
    label: 'Logout',
    onClick: () => signOut(),
  },
]

const getParentPath = (path: string) =>
  path === '/' ? path : `/${path.split('/')[1]}`

export default function Sider() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const assetsToReviewCount = useStore((state) => state.assetsToReviewCount)
  const setAssetsToReviewCount = useStore(
    (state) => state.setAssetsToReviewCount
  )
  const [userAvatarSrc, setuserAvatarSrc] = useState<string>('')

  const items = useMemo(
    () => [
      { title: 'Ask', path: '/', icon: <BulbFilled /> },
      { title: 'Projects', path: '/projects', icon: <AppstoreFilled /> },
      {
        title: 'Review',
        path: '/review',
        icon: (
          <Badge count={assetsToReviewCount} overflowCount={10}>
            <CheckSquareFilled />
          </Badge>
        ),
      },
      { title: 'Settings', path: '/settings', icon: <SettingFilled /> },
    ],
    [assetsToReviewCount]
  )

  useEffect(() => {
    setuserAvatarSrc(localStorage.getItem('userAvatarSrc') || '')
    getAssetsToReviewCountApi()
      .then((c) => setAssetsToReviewCount(c))
      .catch(() => setAssetsToReviewCount(0))
  }, [])

  return (
    <div className={styles.siderContainer}>
      <div className={styles.logoContainer}>
        <img src={'/images/logo.png'} height={40} width={40} />
      </div>
      <div className={styles.menuContainer}>
        {items.map((e) => (
          <div
            className={`${styles.navItem} ${
              getParentPath(pathname) == e.path ? styles.activeNavItem : ''
            }`}
          >
            <Link href={e.path} className={styles.navItemLink}>
              {e.icon}
              <span className={styles.navItemTitle}>{e.title}</span>
            </Link>
          </div>
        ))}
      </div>
      <div className={styles.footer}>
        <Dropdown
          menu={{ items: userMenuItems }}
          placement="topRight"
          trigger={['click']}
        >
          <div className={styles.profileIcon}>
            <Avatar
              src={<img src={userAvatarSrc} referrerPolicy="no-referrer" />}
            />
            <span>{session?.user?.name || 'User'}</span>
          </div>
        </Dropdown>
      </div>
    </div>
  )
}
