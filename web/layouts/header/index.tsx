import {
  BellOutlined,
  LogoutOutlined,
  MailOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Avatar, Dropdown, type MenuProps } from 'antd'
import { signOut, useSession } from 'next-auth/react'
import styles from './header.module.scss'

const userMenuItems: MenuProps['items'] = [
  {
    key: 'logout',
    icon: <LogoutOutlined />,
    label: 'Logout',
    onClick: () => signOut(),
  },
]

const notificationItems: MenuProps['items'] = [
  {
    key: '1',
    icon: <MailOutlined />,
    label:
      'John has uploaded an asset to knowledge group KG3, Click here to review.',
    onClick: () => {},
  },
]

export default function Header() {
  const { data: session, status } = useSession()

  return (
    <div className={styles.headerContainer}>
      <div />
      {status == 'authenticated' && (
        <div className={styles.rightContainer}>
          <Dropdown
            menu={{ items: notificationItems }}
            placement="bottomRight"
            arrow
          >
            <BellOutlined />
          </Dropdown>
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            arrow
          >
            <div className="user-info">
              <Avatar icon={<UserOutlined />} size={'small'} />
              <span style={{ marginLeft: '8px' }}>{session?.user?.name}</span>
            </div>
          </Dropdown>
        </div>
      )}
    </div>
  )
}
