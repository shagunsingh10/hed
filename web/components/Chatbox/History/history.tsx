import { loadMessagesApi } from '@/apis/chats'
import { AVATAR_BG } from '@/constants'
import { ChatWithoutMessage } from '@/types/chats'
import { PlusCircleOutlined, RobotFilled } from '@ant-design/icons'
import { Avatar, Button, message, Typography } from 'antd'
import { useEffect, useRef, useState } from 'react'
import useStore from '../../../store'
import AddChatForm from '../NewChatModal'
import styles from './history.module.scss'

type IChatGroups = {
  Today: ChatWithoutMessage[]
  Yesterday: ChatWithoutMessage[]
  'Last Week': ChatWithoutMessage[]
  'Previous Chats': ChatWithoutMessage[]
}

const getChatTimeline = (chats: ChatWithoutMessage[]): IChatGroups => {
  const todayChats: ChatWithoutMessage[] = []
  const yesterdayChats: ChatWithoutMessage[] = []
  const lastWeekChats: ChatWithoutMessage[] = []
  const earlierChats: ChatWithoutMessage[] = []

  const currentDate = new Date()
  const yesterdayDate = new Date(currentDate)
  yesterdayDate.setDate(currentDate.getDate() - 1)

  const lastWeekStartDate = new Date(currentDate)
  lastWeekStartDate.setDate(currentDate.getDate() - 7)

  chats.forEach((chat) => {
    const chatDate = new Date(chat.lastMessageAt)

    if (chatDate.toDateString() === currentDate.toDateString()) {
      todayChats.push(chat)
    } else if (chatDate.toDateString() === yesterdayDate.toDateString()) {
      yesterdayChats.push(chat)
    } else if (chatDate >= lastWeekStartDate) {
      lastWeekChats.push(chat)
    } else {
      earlierChats.push(chat)
    }
  })

  return {
    Today: todayChats,
    Yesterday: yesterdayChats,
    'Last Week': lastWeekChats,
    'Previous Chats': earlierChats,
  }
}

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
  const chatGroups = getChatTimeline(chats)

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
        {Object.keys(chatGroups).map((chatKey) => (
          <>
            {(chatGroups as any)[chatKey].length > 0 && (
              <Typography.Text>{chatKey}</Typography.Text>
            )}
            {(chatGroups as any)[chatKey].map(
              (chat: ChatWithoutMessage, id: string) => (
                <div
                  key={id}
                  onClick={() => setActiveChat(chat.id)}
                  className={styles.chatListItem}
                >
                  <Avatar
                    icon={<RobotFilled />}
                    style={{ background: AVATAR_BG }}
                  />
                  <div>{chat.title}</div>
                </div>
              )
            )}
          </>
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
