import { useSession, signOut } from "next-auth/react";
import { Avatar, Dropdown } from "antd";
import {
  UserOutlined,
  BellOutlined,
  GlobalOutlined,
  LogoutOutlined,
  MailOutlined,
} from "@ant-design/icons";

import styles from "./header.module.scss";

import type { MenuProps } from "antd";

const userMenuItems: MenuProps["items"] = [
  {
    key: "logout",
    icon: <LogoutOutlined />,
    label: "Logout",
    onClick: () => signOut(),
  },
];

const notificationItems: MenuProps["items"] = [
  {
    key: "1",
    icon: <MailOutlined />,
    label:
      "John has uploaded an asset to knowledge group KG3, Click here to review.",
    onClick: () => {},
  },
];

export default function Header() {
  const { data: session, status } = useSession();

  return (
    <div className={styles.headerContainer}>
      <div className={styles.leftContainer}>
        <span>HERALD</span>
      </div>
      {status == "authenticated" && (
        <div className={styles.rightContainer}>
          <GlobalOutlined />
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
              <Avatar icon={<UserOutlined />} size={"small"} />
              <span style={{ marginLeft: "8px" }}>{session?.user?.name}</span>
            </div>
          </Dropdown>
        </div>
      )}
    </div>
  );
}
