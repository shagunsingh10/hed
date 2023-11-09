"use client";
import Image from "next/image";
import styles from "./page.module.scss";
import { useSession, signIn, signOut } from "next-auth/react";
import { Avatar, Button, Menu, Dropdown } from "antd";
import {
  UserOutlined,
  BellOutlined,
  GlobalOutlined,
  LogoutOutlined,
  MailOutlined,
} from "@ant-design/icons";

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
      <div className={styles.appIcon}>
        <Image src={"/logo.png"} alt="Logo" width={150} height={40} />
      </div>
      <div className={styles.mainHeader}>
        {status == "authenticated" && (
          <div className={styles.rightHeaderMenu}>
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
                <Avatar icon={<UserOutlined />} />
                <span style={{ marginLeft: "8px" }}>{session?.user?.name}</span>
              </div>
            </Dropdown>
          </div>
        )}
      </div>
    </div>
  );
}
