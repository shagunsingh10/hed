import {
  AppstoreOutlined,
  PlusCircleOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons'
import { Button, Switch } from 'antd'
import { useState } from 'react'
import CreateProjectForm from './newProject'
import ProjectsGrid from './projectGrid'
import styles from './projects.module.scss'
import ProjectsList from './projectsList'

const ProjectsScreen = () => {
  const [createProjectTab, setCreateProjectTab] = useState<boolean>(false)
  const [listView, setListView] = useState<boolean>(false)

  const handleProjectCreateButton = () => {
    setCreateProjectTab(true)
  }

  const closeProjectCreationForm = () => {
    setCreateProjectTab(false)
  }

  const toggleListView = () => {
    setListView((prev) => !prev)
  }

  return (
    <div className={styles.projectsContainer}>
      <div className={styles.screenHeader}>
        <div className={styles.screenTitle}>
          {createProjectTab ? 'Create new project' : 'Projects'}
        </div>
        {!createProjectTab && (
          <div className={styles.rightHeader}>
            <Switch
              className={styles.listToggleSwitch}
              size="default"
              checked={listView}
              onChange={toggleListView}
              checkedChildren={<AppstoreOutlined />}
              unCheckedChildren={<UnorderedListOutlined />}
            />
            <Button
              type="primary"
              ghost
              onClick={handleProjectCreateButton}
              className={styles.createNewButton}
              icon={<PlusCircleOutlined />}
            >
              Create Project
            </Button>
          </div>
        )}
      </div>

      <ProjectsGrid visible={!listView} />
      <ProjectsList visible={listView} />
      <CreateProjectForm
        open={createProjectTab}
        closeProjectCreationForm={closeProjectCreationForm}
      />
    </div>
  )
}

export default ProjectsScreen
