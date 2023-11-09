"use client";

import { Menu } from "antd";
import { useRouter, usePathname } from "next/navigation";
import { ProjectOutlined, QuestionCircleOutlined } from "@ant-design/icons";

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
  getItem("Projects", "/projects", <ProjectOutlined />),
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
        <p>&copy; 2023 Herald</p>
        <p>Contact: info@heraldkms.com</p>
        <p>Follow us: @keraldkms</p>
      </footer>
    </div>
  );
}
