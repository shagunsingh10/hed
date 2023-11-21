import useStore from '@/store'
import { MessageFilled, PlusCircleOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { FC, useEffect } from 'react'
import styles from './history.module.scss'

type ChatHistoryProps = {
  scope: 'generic' | 'project'
  projectId?: string
}

const ChatHistory: FC<ChatHistoryProps> = ({ scope, projectId }) => {
  const chats = useStore((state) => state.chats)
  const loadChats = useStore((state) => state.loadChats)
  const addChat = useStore((state) => state.addChat)
  const setActiveChatId = useStore((state) => state.setActiveChatId)

  //functions
  const addNewChat = async () => {
    const newChatId = await addChat(projectId)
    setActiveChatId(newChatId)
    loadChats(scope, projectId) // on success
  }

  useEffect(() => {
    if (loadChats) loadChats(scope, projectId)
  }, [loadChats, scope, projectId])

  return (
    <div className={styles.chatHistory}>
      <Button
        type="primary"
        ghost
        size="large"
        onClick={addNewChat}
        className={styles.addChatBtn}
      >
        <PlusCircleOutlined />
        New Chat
      </Button>

      {chats.map((chat, id) => (
        <div
          key={id}
          onClick={() => setActiveChatId(chat.id)}
          className={styles.chatListItem}
        >
          <MessageFilled />
          <div>{chat.title}</div>
        </div>
      ))}
    </div>
  )
}

export default ChatHistory
