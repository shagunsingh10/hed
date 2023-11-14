import { Row, Tabs, Col, Typography, message } from "antd";
import {
  AppstoreFilled,
  UserOutlined,
  BookOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { useParams } from "next/navigation";
import useStore from "@/store";
import Loader from "@/components/Loader";
import { useEffect, useState } from "react";
import { Project } from "@/types/projects";
import KGScreen from "../kg";
import ProjectUsers from "../projectUsers";
import Chatbox from "@/components/Chatbox";

import styles from "./projectDetails.module.scss";

const ProjectDetailsScreen = () => {
  const { projectId }: { projectId: string } = useParams();
  const getProjectById = useStore((state) => state.getProjectById);
  const [project, setProject] = useState<Project>();
  const [loading, setLoading] = useState<boolean>(false);

  const tabs = [
    {
      title: "Knowledge Groups",
      icon: <BookOutlined />,
      content: <KGScreen projectId={projectId} />,
    },
    {
      title: "Chat",
      icon: <MailOutlined />,
      content: <Chatbox scope="project" projectId={projectId} height="65vh" />,
    },
    { title: "Users", icon: <UserOutlined />, content: <ProjectUsers /> },
  ];

  useEffect(() => {
    setLoading(true);
    getProjectById(projectId)
      .then((project) => {
        setProject(project);
        setLoading(false);
      })
      .catch((e) => {
        message.error("Error in fetching project!");
        setLoading(false);
      });
  }, [projectId]);

  if (!projectId || loading) {
    return <Loader />;
  }

  return (
    <div className={styles.projectDetailsContainer}>
      <Row className={styles.projectDetailsHead}>
        <Col span={2}>
          <img
            src="/images/project-icon.jpg"
            alt="project"
            height={70}
            width={70}
            style={{ borderRadius: "0.5em" }}
          />
        </Col>
        <Col span={22}>
          <span className={styles.projectTitle}>{project?.name}</span>
          <span className={styles.projectDescription}>
            {project?.description}
          </span>
        </Col>
      </Row>
      <div className={styles.projectDetailsContent}>
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

export default ProjectDetailsScreen;
