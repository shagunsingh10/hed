import { getAssetsToReviewCountApi } from '@/apis/assets'
import useStore from '@/store'
import { Indicator } from '@mantine/core'
import {
  IconBulbFilled,
  IconChecklist,
  IconPackage,
  IconSettings,
} from '@tabler/icons-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import styles from './sider.module.scss'

const getParentPath = (path: string) =>
  path === '/' ? path : `/${path.split('/')[1]}`

export default function Sider() {
  const pathname = usePathname()
  const assetsToReviewCount = useStore((state) => state.assetsToReviewCount)
  const setAssetsToReviewCount = useStore(
    (state) => state.setAssetsToReviewCount
  )

  const items = useMemo(
    () => [
      { title: 'Ask', path: '/', icon: <IconBulbFilled /> },
      { title: 'Projects', path: '/projects', icon: <IconPackage /> },
      {
        title: 'Review',
        path: '/review',
        icon: (
          <Indicator
            inline
            color="red"
            label={assetsToReviewCount}
            size={20}
            disabled={assetsToReviewCount < 1}
          >
            <IconChecklist />
          </Indicator>
        ),
      },
      { title: 'Settings', path: '/settings', icon: <IconSettings /> },
    ],
    [assetsToReviewCount]
  )

  useEffect(() => {
    getAssetsToReviewCountApi()
      .then((c) => setAssetsToReviewCount(c))
      .catch(() => setAssetsToReviewCount(0))
  }, [])

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
