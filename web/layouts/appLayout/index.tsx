import type { Metadata } from "next";
import { useSession } from "next-auth/react";

import Sider from "../sider";
import Header from "../header";
import Loader from "@/components/Loader";
import LoginScreen from "../login";

import styles from "./layout.module.scss";

export const metadata: Metadata = {
  title: "Herald",
  description: "Knowledge management system",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession();

  if (status === "loading") {
    return <Loader />;
  }

  if (status === "unauthenticated") {
    return <LoginScreen />;
  }

  return (
    <div className={styles.layout}>
      <div className={styles.header}>
        <Header />
      </div>
      <div className={styles.content}>
        <div className={styles.sider}>
          <Sider />
        </div>
        <div className={styles.main_body}>{children}</div>
      </div>
    </div>
  );
}
