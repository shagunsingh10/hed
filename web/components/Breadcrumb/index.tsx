import { HomeFilled } from '@ant-design/icons'
import { Breadcrumb } from 'antd'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styles from './breadcrumb.module.scss'

const nonNonPageRoutes = ['kgs']
const BreadcrumbComponent = () => {
  const router = useRouter()
  const pathSegments = router.asPath
    .split('/')
    .filter((segment) => segment !== '')
    .filter((r) => !nonNonPageRoutes.includes(r))

  return pathSegments.length > 0 ? (
    <Breadcrumb className={styles.breadcrumbContainer}>
      <Breadcrumb.Item>
        <Link href="/" style={{ display: 'flex', gap: '0.5em' }}>
          <HomeFilled />
          Home
        </Link>
      </Breadcrumb.Item>
      {pathSegments.map((segment, index) => (
        <Breadcrumb.Item key={index}>
          {index === pathSegments.length - 1 ? (
            <span className={styles.breadcrumbItem}>{segment}</span>
          ) : (
            <Link href={`/${pathSegments.slice(0, index + 1).join('/')}`}>
              {segment}
            </Link>
          )}
        </Breadcrumb.Item>
      ))}
    </Breadcrumb>
  ) : (
    <div style={{ margin: '0.5em 1em' }} />
  )
}

export default BreadcrumbComponent
