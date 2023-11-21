import useStore from '@/store'
import { FC, useEffect } from 'react'
import ChatWindow from './chat/chatwindow'
import styles from './chatbot.module.scss'
import ChatHistory from './history/chatHistory'

type ChatBoxProps = {
  scope: 'generic' | 'project'
  projectId?: string
}

const Chatbox: FC<ChatBoxProps> = ({ scope, projectId }) => {
  // states
  const loadChats = useStore((state) => state.loadChats)
  const activeChatId = useStore((state) => state.activeChatId)

  useEffect(() => {
    if (loadChats) loadChats(scope, projectId)
  }, [loadChats, scope, projectId])

  return (
    <div className={styles.chatScreen}>
      <div className={styles.chatHistoryContainer}>
        <ChatHistory scope={scope} projectId={projectId} />
      </div>
      <div className={styles.chatWindowContainer}>
        <ChatWindow chatId={activeChatId} projectId={projectId} />
      </div>
    </div>
  )
}

export default Chatbox
