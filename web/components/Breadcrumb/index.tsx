import { Anchor, Breadcrumbs, Group, Text } from '@mantine/core'
import { IconHome } from '@tabler/icons-react'
import { useRouter } from 'next/router'
import styles from './breadcrumb.module.scss'

const nonNonPageRoutes = ['kgs']
const BreadcrumbComponent = () => {
  const router = useRouter()

  const pathSegments = router.asPath
    .split('/')
    .filter((segment) => segment !== '')
    .filter((r) => !nonNonPageRoutes.includes(r))

  return (
    <Breadcrumbs separator="→" mt="xs">
      <Anchor href="/" size="xs">
        <Group>
          <IconHome size={13} />
          Home
        </Group>
      </Anchor>
      {pathSegments.map((segment, index) =>
        index === pathSegments.length - 1 ? (
          <Text size="xs" className={styles.breadcrumbItem}>
            {segment}
          </Text>
        ) : (
          <Anchor
            href={`/${pathSegments.slice(0, index + 1).join('/')}`}
            size="xs"
          >
            {segment}
          </Anchor>
        )
      )}
    </Breadcrumbs>
  )
}

export default BreadcrumbComponent
