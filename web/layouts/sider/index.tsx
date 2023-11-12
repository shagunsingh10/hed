import { usePathname } from "next/navigation";
import { ProfileFilled, RobotFilled } from "@ant-design/icons";
import Link from "next/link";
import { Tooltip } from "antd";
import styles from "./sider.module.scss";

const items = [
  { title: "Ask", path: "/", icon: <RobotFilled /> },
  { title: "Projects", path: "/projects", icon: <ProfileFilled /> },
];

export default function Sider() {
  const pathname = usePathname();

  return (
    <div className={styles.siderContainer}>
      <div className={styles.menuContainer}>
        {items.map((e) => (
          <Tooltip placement="right" title={e.title} key={e.path}>
            <div
              className={
                pathname == e.path ? styles.activeNavItem : styles.navItem
              }
            >
              <Link href={e.path}>{e.icon}</Link>
            </div>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}
