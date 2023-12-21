import { getChatsApi, loadMessagesApi } from '@/apis/chats'
import OverlayLoader from '@/components/Loader'
import { ChatWithoutMessage } from '@/types/chats'
import { Group, Input, NavLink, Text } from '@mantine/core'
import { showNotification } from '@mantine/notifications'
import { IconMessage2, IconSearch } from '@tabler/icons-react'
import { ChangeEvent, useEffect, useRef, useState } from 'react'
import useStore from '../../../store'
import AddChatForm from '../new-chat'
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
  const [filteredChats, setFilteredChats] = useState<ChatWithoutMessage[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const setChats = useStore((state) => state.setChats)
  const setMessages = useStore((state) => state.setMessages)
  const setActiveChat = useStore((state) => state.setActiveChat)
  const activeChat = useStore((state) => state.activeChat)
  const chats = useStore((state) => state.chats)
  const messages = useStore((state) => state.messages)

  const chatWindowRef = useRef<HTMLDivElement>(null)
  const chatGroups = getChatTimeline(filteredChats)

  // functions
  const filterChats = (e: ChangeEvent<HTMLInputElement>) => {
    setFilteredChats(
      chats.filter((chat) => {
        return chat.title?.toLowerCase().includes(e.target.value.toLowerCase())
      })
    )
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
        .catch(() =>
          showNotification({
            message: 'Failed to load previous messages',
            color: 'red',
          })
        )
    }
  }, [activeChat?.id])

  useEffect(() => {
    setLoading(true)
    getChatsApi()
      .then((chats) => {
        setChats(chats)
      })
      .catch(() =>
        showNotification({
          message: 'Failed to load previous chats.',
          color: 'red',
        })
      )
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => setFilteredChats(chats), [...chats])

  return (
    <div className={styles.chatHistory}>
      {loading && <OverlayLoader />}
      <AddChatForm />
      <Input
        size="xs"
        rightSection={<IconSearch size={14} />}
        className={styles.search}
        placeholder="Search chats"
        onChange={filterChats}
      />
      <div className={styles.chatHistoryList}>
        {Object.keys(chatGroups).map((chatKey) => (
          <>
            {(chatGroups as any)[chatKey].length > 0 && (
              <Text size="sm" fw={500} className={styles.timeline}>
                {chatKey}
              </Text>
            )}
            {(chatGroups as any)[chatKey].map((chat: ChatWithoutMessage) => (
              <NavLink
                className={styles.chatItem}
                leftSection={<IconMessage2 size={15} />}
                label={chat.title}
                active={activeChat?.id === chat.id}
                onClick={() => setActiveChat(chat.id)}
              />
            ))}
          </>
        ))}
        {chats.length === 0 && (
          <Group justify="center">
            <Text size="xs" fw={500} className={styles.timeline}>
              No Chats
            </Text>
          </Group>
        )}
      </div>
    </div>
  )
}

export default ChatHistory
