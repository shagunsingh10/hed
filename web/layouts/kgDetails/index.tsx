import { Row, Col, message, Tabs } from "antd";
import {
  UpCircleOutlined,
  DownCircleOutlined,
  UserOutlined,
  FileDoneOutlined,
} from "@ant-design/icons";
import { useParams } from "next/navigation";
import useStore from "@/store";
import Loader from "@/components/Loader";
import { useEffect, useState } from "react";
import { Kg } from "@/types/kgs";

import styles from "./kgDetails.module.scss";
import KgUsers from "../kgUsers";
import AssetScreen from "../asset";

const KgDetailsScreen = () => {
  const { projectId, kgId }: { projectId: string; kgId: string } = useParams();
  const [kg, setkg] = useState<Kg>();
  const [loading, setLoading] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const getKgById = useStore((state) => state.getKgById);

  const tabs = [
    {
      title: "Assets",
      icon: <FileDoneOutlined />,
      content: <AssetScreen projectId={projectId} kgId={kgId} />,
    },
    { title: "Users", icon: <UserOutlined />, content: <KgUsers /> },
  ];

  useEffect(() => {
    setLoading(true);
    getKgById(projectId, kgId)
      .then((kg) => {
        setkg(kg);
        setLoading(false);
      })
      .catch((e) => {
        message.error("Error in fetching kg!");
        setLoading(false);
      });
  }, [projectId, kgId]);

  if (!projectId || !kgId || loading) {
    return <Loader />;
  }

  return (
    <div className={styles.kgDetailsContainer}>
      <div className={styles.fullScreenToggle}>
        {isFullScreen ? (
          <DownCircleOutlined onClick={() => setIsFullScreen(false)} />
        ) : (
          <UpCircleOutlined onClick={() => setIsFullScreen(true)} />
        )}
      </div>
      <Row
        className={`${styles.kgDetailsHead} ${
          isFullScreen ? styles.hidden : ""
        }`}
      >
        <Col span={2}>
          <img
            src="/images/kg1.jpg"
            alt="project"
            height={70}
            width={70}
            style={{ borderRadius: "0.5em" }}
          />
        </Col>
        <Col span={22}>
          <span className={styles.kgTitle}>{kg?.name}</span>
          <span className={styles.kgDescription}>{kg?.description}</span>
        </Col>
      </Row>
      <div className={styles.kgDetailsContent}>
        <Tabs
          style={{ width: "100%" }}
          defaultActiveKey="1"
          type="card"
          size={"small"}
          items={tabs.map((tab, i) => {
            return {
              label: (
                <span>
                  {tab.icon}
                  {tab.title}
                </span>
              ),
              key: String(i + 1),
              children: tab.content,
            };
          })}
        />
      </div>
    </div>
  );
};

export default KgDetailsScreen;
