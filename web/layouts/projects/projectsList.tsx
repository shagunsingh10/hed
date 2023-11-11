import { List, Tag } from "antd";
import { AppstoreFilled } from "@ant-design/icons";
import useStore from "@/store";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import styles from "./projects.module.scss";

const ProjectsList = () => {
  const projects = useStore((state) => state.projects);
  const getProjects = useStore((state) => state.getProjects);

  const { push } = useRouter();

  useEffect(() => {
    if (getProjects) getProjects();
  }, [getProjects]);

  const handleProjectClick = (id: string) => {
    sessionStorage.setItem(
      id,
      JSON.stringify(projects.find((e) => e.id === id))
    );
    push(`projects/${id}`, {
      scroll: false,
    });
  };

  return (
    <div className={styles.projectList}>
      <List
        itemLayout="horizontal"
        dataSource={projects}
        renderItem={(item, index) => (
          <List.Item key={index}>
            <List.Item.Meta
              avatar={<AppstoreFilled className={styles.projectAvatar} />}
              title={
                <div className={styles.projectTitleContainer}>
                  <div
                    className={styles.projectTitle}
                    onClick={() => handleProjectClick(item.id)}
                  >
                    {item.name}
                  </div>
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
