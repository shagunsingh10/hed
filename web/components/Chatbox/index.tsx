import styles from './chat.module.scss'
import ChatWindow from './ChatWindow'
import ChatHistory from './History/history'

const NewChat = () => {
  return (
    <div className={styles.chatScreenContainer}>
      <div className={styles.chatHistoryContainer}>
        <ChatHistory />
      </div>
      <div className={styles.chatBoxContainer}>
        <ChatWindow />
      </div>
    </div>
  )
}

export default NewChat
