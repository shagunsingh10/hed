"use client";

import { Row, Tabs, Col, Typography, message, Card } from "antd";
import { ProjectFilled, UserOutlined, BookOutlined } from "@ant-design/icons";
import { useParams } from "next/navigation";
import useStore from "store";
import Loader from "@/components/Loader";
import { useEffect, useState } from "react";
import { ProjectSlice } from "types/projects";
import KGScreen from "@/app/knowledge-groups";

import styles from "./projectDetails.module.scss";

const tabs = ["Knowledge Groups", "Admins"];
const ProjectsScreen = () => {
  const { id }: { id: string } = useParams();
  const { getProjectById } = useStore((state) => ({
    getProjectById: state.getProjectById,
  }));

  const [project, setProject] = useState<ProjectSlice>();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    getProjectById(id)
      .then((project) => {
        setProject(project);
        setLoading(false);
      })
      .catch((e) => {
        message.error("Error in fetching project!");
        setLoading(false);
      });
  }, [id]);

  if (!id || loading) {
    return <Loader />;
  }

  return (
    <Card className={styles.projectDetailsContainer}>
      <Row className={styles.projectDetailsHead}>
        <Col span={4}>
          <ProjectFilled className={styles.projectAvatar} />
        </Col>
        <Col span={20}>
          <Typography.Title>{project?.name}</Typography.Title>
          <Typography.Paragraph className={styles.projectDescription}>
            {project?.description}
          </Typography.Paragraph>
        </Col>
      </Row>
      <Row>
        <Tabs
          defaultActiveKey="1"
          type="card"
          size={"small"}
          items={tabs.map((tab, i) => {
            return {
              label: (
                <span>
                  {tab === "Admins" ? <UserOutlined /> : <BookOutlined />}
                  {tab}
                </span>
              ),
              key: String(i + 1),
              children: <KGScreen />,
            };
          })}
        />
      </Row>
    </Card>
  );
};

export default ProjectsScreen;
