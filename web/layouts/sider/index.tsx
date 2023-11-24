import { ProfileFilled, RobotFilled } from '@ant-design/icons'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './sider.module.scss'

const getParentPath = (path: string) =>
  path === '/' ? path : `/${path.split('/')[1]}`

const items = [
  { title: 'Ask', path: '/', icon: <RobotFilled /> },
  { title: 'Projects', path: '/projects', icon: <ProfileFilled /> },
]

export default function Sider() {
  const pathname = usePathname()

  return (
    <div className={styles.siderContainer}>
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
    </div>
  )
}
