import { Empty, Tag } from "antd";
import useStore from "@/store";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Skeleton } from "antd";
import styles from "./projects.module.scss";

const { Meta } = Card;

const ProjectsGrid = ({ visible }: { visible: boolean }) => {
  const [loading, setLoading] = useState(false);
  const projects = useStore((state) => state.projects);
  const getProjects = useStore((state) => state.getProjects);

  const { push } = useRouter();

  useEffect(() => {
    if (getProjects) {
      setLoading(true);
      getProjects().then(() => setLoading(false));
    }
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
    <div
      className={styles.projectCardsContainer}
      style={{
        opacity: `${visible ? 1 : 0}`,
        height: `${visible ? "" : "0"}`,
        padding: `${visible ? "" : "0"}`,
      }}
    >
      {projects?.length > 0 ? (
        projects.map((item, key) => (
          <Card
            key={key}
            className={styles.projectCard}
            onClick={() => handleProjectClick(item.id)}
          >
            <Skeleton loading={loading} avatar active>
              <Meta
                avatar={
                  <img
                    src="/images/project-icon.jpg"
                    alt="project"
                    height={70}
                    width={70}
                    style={{ borderRadius: "0.5em" }}
                  />
                }
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
                  </div>
                }
              />
            </Skeleton>
          </Card>
        ))
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </div>
  );
};

export default ProjectsGrid;
