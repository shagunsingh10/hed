import { loadMessagesApi } from '@/apis/chats'
import { PlusCircleOutlined, RobotFilled } from '@ant-design/icons'
import { Avatar, Button, message } from 'antd'
import { useEffect, useRef, useState } from 'react'
import useStore from '../../../store'
import AddChatForm from '../NewChatModal'
import styles from './history.module.scss'

const ChatHistory = () => {
  // states
  const [newChatModalOpen, setNewChatModalOpen] = useState(false)

  const loadChats = useStore((state) => state.loadChats)
  const setMessages = useStore((state) => state.setMessages)
  const setActiveChat = useStore((state) => state.setActiveChat)
  const activeChat = useStore((state) => state.activeChat)
  const chats = useStore((state) => state.chats)
  const messages = useStore((state) => state.messages)

  const chatWindowRef = useRef<HTMLDivElement>(null)

  const addNewChat = async () => {
    setNewChatModalOpen(true)
  }

  // useEffects
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (activeChat?.id) {
      loadMessagesApi(activeChat?.id)
        .then((messages) => setMessages(messages))
        .catch(() => message.error('Failed to load previous messages'))
    }
  }, [activeChat?.id])

  useEffect(() => {
    loadChats()
  }, [])

  return (
    <div className={styles.chatHistory}>
      <Button
        type="primary"
        size="large"
        onClick={addNewChat}
        className={styles.addChatBtn}
      >
        <PlusCircleOutlined />
        New Chat
      </Button>

      <div className={styles.chatHistoryList}>
        {chats.map((chat, id) => (
          <div
            key={id}
            onClick={() => setActiveChat(chat.id)}
            className={styles.chatListItem}
          >
            <Avatar icon={<RobotFilled />} />
            <div>{chat.title}</div>
          </div>
        ))}
      </div>
      <AddChatForm
        open={newChatModalOpen}
        onClose={() => setNewChatModalOpen(false)}
      />
    </div>
  )
}

export default ChatHistory
