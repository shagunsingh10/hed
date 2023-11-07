"use client";

import { Menu } from "antd";
import { useRouter, usePathname } from "next/navigation";
import {
  ProjectOutlined,
  BulbOutlined,
  QuestionCircleOutlined,
  MessageOutlined,
} from "@ant-design/icons";

import type { MenuProps } from "antd";
import styles from "./page.module.scss";

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: "group"
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as MenuItem;
}

const items: MenuItem[] = [
  getItem("Ask", "/", <QuestionCircleOutlined />),
  getItem("Chats", "/chats", <MessageOutlined />),
  getItem("Projects", "/projects", <ProjectOutlined />),
  getItem("Knowledge Groups", "/knowledge-groups", <BulbOutlined />),
];

export default function Sider() {
  const { push } = useRouter();
  const pathname = usePathname();

  const handleMenuClick = (item: any) => {
    push(item.key);
  };

  return (
    <div className={styles.siderContainer}>
      <div className={styles.menuContainer}>
        <Menu
          defaultSelectedKeys={[pathname || "0"]}
          defaultOpenKeys={[pathname || "0"]}
          mode="inline"
          color="secondary"
          inlineCollapsed={false}
          items={items}
          onClick={handleMenuClick}
        />
      </div>
      <footer className={styles.footer}>
        <p>&copy; 2023 K Base</p>
        <p>Contact: info@kbase.com</p>
        <p>Follow us: @kbase</p>
      </footer>
    </div>
  );
}
