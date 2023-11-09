"use client";

import type { Metadata } from "next";
import { Col, Row } from "antd";
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
    <div>
      <Row className={styles.header}>
        <Header />
      </Row>
      <Row className={styles.body}>
        <Col className={styles.sider} span={4}>
          <Sider />
        </Col>
        <Col className={styles.content} span={20}>
          {children}
        </Col>
      </Row>
    </div>
  );
}
