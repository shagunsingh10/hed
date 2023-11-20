import { Row, Tabs, Col, message } from "antd";
import {
  UpCircleOutlined,
  PlusCircleOutlined,
  DownCircleOutlined,
  UserOutlined,
  BookOutlined,
  MailOutlined,
  FileDoneOutlined,
} from "@ant-design/icons";
import { useParams } from "next/navigation";
import useStore from "@/store";
import Loader from "@/components/Loader";
import { useEffect, useMemo, useState } from "react";
import { Project } from "@/types/projects";
import KGScreen from "../../kg";
import ProjectUsers from "../projectUsers";
import Chatbox from "@/components/Chatbox";
import AssetScreen from "../../asset";
import styles from "./projectDetails.module.scss";
import CreateAssetForm from "../../asset/createAsset";
import CreateKGForm from "../../kg/createKg";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const ProjectDetailsScreen = () => {
  const smallScreen = useMediaQuery(768);
  const { projectId }: { projectId: string } = useParams();
  const getProjectById = useStore((state) => state.getProjectById);
  const [project, setProject] = useState<Project>();
  const [loading, setLoading] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  const tabs = useMemo(
    () => [
      {
        title: "Assets",
        icon: <FileDoneOutlined />,
        content: <AssetScreen projectId={projectId} />,
      },
      {
        title: "Add Asset",
        icon: <PlusCircleOutlined />,
        content: <CreateAssetForm projectId={projectId} />,
      },
      {
        title: "Chat",
        icon: <MailOutlined />,
        content: (
          <Chatbox
            scope="project"
            projectId={projectId}
            height={isFullScreen ? "81vh" : "65vh"}
          />
        ),
      },
      {
        title: "Knowledge Groups",
        icon: <BookOutlined />,
        content: <KGScreen projectId={projectId} />,
      },
      {
        title: "Add Knowledge Group",
        icon: <PlusCircleOutlined />,
        content: <CreateKGForm projectId={projectId} />,
      },
      { title: "Users", icon: <UserOutlined />, content: <ProjectUsers /> },
    ],
    [projectId, isFullScreen]
  );

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
      <div className={styles.fullScreenToggle}>
        {isFullScreen ? (
          <DownCircleOutlined onClick={() => setIsFullScreen(false)} />
        ) : (
          <UpCircleOutlined onClick={() => setIsFullScreen(true)} />
        )}
      </div>

      <Row
        className={`${styles.projectDetailsHead} ${
          isFullScreen ? styles.hidden : ""
        }`}
      >
        <Col span={2} className={styles.projectAvatar}>
          <img
            src="/images/project-icon.jpg"
            alt="project"
            height={70}
            width={70}
          />
        </Col>
        <Col span={22}>
          <span className={styles.projectTitle}>{project?.name} </span>
          <span className={styles.projectDescription}>
            {project?.description}
          </span>
        </Col>
      </Row>
      <div
        className={`${styles.projectDetailsContent} ${
          isFullScreen ? styles.projectDetailsContentExpanded : ""
        }`}
      >
        <Tabs
          defaultActiveKey="1"
          type="card"
          tabBarGutter={10}
          tabPosition={smallScreen ? "top" : "left"}
          tabBarStyle={{ marginRight: "0.5em" }}
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
