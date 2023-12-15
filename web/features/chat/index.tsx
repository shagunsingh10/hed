import { Divider } from '@mantine/core'
import ChatWindow from './chat-window'
import styles from './chat.module.scss'
import ChatHistory from './history'

const ProjectDetailsScreen = () => {
  return (
    <>
      <Divider size="xs" />
      <div className={styles.content}>
        <div className={styles.menuContent}>
          <ChatHistory />
        </div>
        <Divider size="xs" orientation="vertical" />
        <div className={styles.tabContent}>
          <ChatWindow />
        </div>
      </div>
    </>
  )
}

export default ProjectDetailsScreen
