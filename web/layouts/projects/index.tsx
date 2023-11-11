import { Button } from "antd";
import { useState } from "react";
import { FolderAddOutlined } from "@ant-design/icons";

import CreateProjectForm from "./newProject";
import ProjectsList from "./projectsList";

import styles from "./projects.module.scss";

const ProjectsScreen = () => {
  const [createProjectTab, setCreateProjectTab] = useState<boolean>(false);

  const handleProjectCreateButton = () => {
    setCreateProjectTab(true);
  };

  const closeProjectCreationForm = () => {
    setCreateProjectTab(false);
  };

  return (
    <div className={styles.projectsContainer}>
      <div className={styles.screenHeader}>
        <div className={styles.screenTitle}>
          {createProjectTab ? "Create new project" : "Projects"}
        </div>
        {!createProjectTab && (
          <Button type="primary" onClick={handleProjectCreateButton}>
            <FolderAddOutlined />
            Create new project
          </Button>
        )}
      </div>
      {createProjectTab ? (
        <CreateProjectForm
          closeProjectCreationForm={closeProjectCreationForm}
        />
      ) : (
        <ProjectsList />
      )}
    </div>
  );
};

export default ProjectsScreen;
