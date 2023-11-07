"use client";

import { List, Tag, Divider } from "antd";
import styles from "./projects.module.scss";
import { ProjectFilled, LikeOutlined, StarOutlined } from "@ant-design/icons";
import useStore from "store";
import { useEffect } from "react";

const ProjectsList = () => {
  const { projects, getProjects } = useStore((state) => ({
    projects: state.projects,
    getProjects: state.getProjects,
  }));

  useEffect(() => {
    getProjects();
  }, []);

  return (
    <div className={styles.projectList}>
      <List
        itemLayout="horizontal"
        dataSource={projects}
        renderItem={(item, index) => (
          <List.Item key={index}>
            <List.Item.Meta
              avatar={<ProjectFilled className={styles.projectAvatar} />}
              title={
                <div className={styles.projectTitleContainer}>
                  <div className={styles.projectTitle}>{item.name}</div>
                  <div className={styles.projectTags}>
                    {item.tags.map((tag) => (
                      <Tag key={tag} color="#434343">
                        {tag}
                      </Tag>
                    ))}
                  </div>
                </div>
              }
              description={
                <div className={styles.projectDescriptionContainer}>
                  <div className={styles.projectDescription}>
                    {item.description}
                  </div>
                  <div className={styles.projectMetrics}>
                    <StarOutlined />
                    {item.stars}
                    <Divider type="vertical" />
                    <LikeOutlined />
                    {item.likes}
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default ProjectsList;
