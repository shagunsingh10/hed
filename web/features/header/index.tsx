import { ActionIcon, Avatar, Indicator, Menu, Title } from '@mantine/core'
import { IconBell, IconLogout } from '@tabler/icons-react'
import { signOut, useSession } from 'next-auth/react'
import styles from './header.module.scss'

export default function Header() {
  const { data: session, status } = useSession()

  return (
    <div className={styles.headerContainer}>
      <div>
        <Title order={3}>HERALD</Title>
      </div>
      {status == 'authenticated' && (
        <div className={styles.rightContainer}>
          <Menu position="bottom-end">
            <Indicator
              inline
              color="red"
              label={10}
              size={14}
              disabled={false}
              mt="sm"
            >
              <Menu.Target>
                <ActionIcon variant="transparent">
                  <IconBell size={20} className={styles.notifications} />
                </ActionIcon>
              </Menu.Target>
            </Indicator>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconBell size={15} />}>
                John uploaded an inspiring asset
              </Menu.Item>
              <Menu.Item leftSection={<IconBell size={15} />}>
                New creation alert: Check out John's latest upload!
              </Menu.Item>
              <Menu.Item leftSection={<IconBell size={15} />}>
                Breaking news: John has shared a captivating asset
              </Menu.Item>
              <Menu.Item leftSection={<IconBell size={15} />}>
                Quick update: John's impressive asset is live!
              </Menu.Item>
              <Menu.Item leftSection={<IconBell size={15} />}>
                Artistic bulletin: Dive into John's latest masterpiece
              </Menu.Item>
              <Menu.Item leftSection={<IconBell size={15} />}>
                Alert: John just added a new and exciting asset
              </Menu.Item>
              <Menu.Item leftSection={<IconBell size={15} />}>
                Creative update: John's canvas now features a fresh asset
              </Menu.Item>
              <Menu.Item leftSection={<IconBell size={15} />}>
                Inspiration flash: John strikes again with a new upload
              </Menu.Item>
              <Menu.Item leftSection={<IconBell size={15} />}>
                Digital discovery: Witness the unveiling of John's creation
              </Menu.Item>
              <Menu.Item leftSection={<IconBell size={15} />}>
                Art alert: John's masterpiece is now unleashed!
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
          <Menu position="bottom-end">
            <Menu.Target>
              <Avatar size="sm" src={session.user?.image as string} />
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconLogout size={20} />}
                onClick={() => signOut()}
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>
      )}
    </div>
  )
}
