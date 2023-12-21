import { addNewChatApi, loadMessagesApi } from '@/apis/chats'
import { globalDateFormatParser } from '@/lib/utils/functions'
import { Message } from '@/types/chats'
import {
  ActionIcon,
  Avatar,
  Group,
  Loader,
  Text,
  Textarea,
} from '@mantine/core'
import { showNotification } from '@mantine/notifications'
import { IconBulb, IconMessagePlus, IconSend } from '@tabler/icons-react'
import { useEffect, useRef, useState } from 'react'
import useStore from '../../../store'
import MessageBody from '../message'
import styles from './chat.module.scss'

const ChatWindow = () => {
  // states
  const [inputValue, setInputValue] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [userAvatarSrc, setuserAvatarSrc] = useState<string>('')

  const postQuery = useStore((state) => state.postQuery)
  const setMessages = useStore((state) => state.setMessages)
  const addChat = useStore((state) => state.addChat)
  const activeChat = useStore((state) => state.activeChat)
  const messages = useStore((state) => state.messages)
  const waitingForResponse = useStore((state) => state.waitingForResponse)

  const chatWindowRef = useRef<HTMLDivElement>(null)

  const waitingForResponseMessage: Message = {
    id: 'waiting-for-response',
    chatId: activeChat?.id || '',
    content: '',
    timestamp: new Date(),
    isResponse: true,
  }

  // functions
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
  }

  const handleSendMessage = async () => {
    if (inputValue.trim() !== '') {
      if (activeChat?.id) {
        postQuery(activeChat.id, inputValue)
      } else {
        addNewChatApi('Untitled')
          .then((chat) => addChat(chat))
          .catch((e: Error) =>
            showNotification({
              message: e.message.toString(),
              color: 'red',
            })
          )
          .finally(() => setLoading(false))
      }
      setInputValue('')
    }
  }

  const handleEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.altKey && e.key === 'Enter') {
      setInputValue((prev) => prev + '\n')
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSendMessage()
    }
  }
  // useEffects
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight
    }
  }, [{ ...messages }])

  useEffect(() => {
    if (activeChat?.id) {
      setLoading(true)
      loadMessagesApi(activeChat.id)
        .then((messages) => setMessages(messages))
        .catch(() =>
          showNotification({
            message: 'Failed to load previous messages',
            color: 'red',
          })
        )
        .finally(() => setLoading(false))
    }
  }, [activeChat])

  useEffect(() => {
    setuserAvatarSrc(localStorage.getItem('userAvatarSrc') || '')
  }, [])

  if (loading) return <Loader />

  if (!activeChat) {
    return (
      <Group justify="center" opacity={0.3} h="80vh" align="center">
        <IconMessagePlus size={40} />
        <Text>Create your first chat to start talking</Text>
      </Group>
    )
  }

  return (
    <div className={styles.chatWindow}>
      <div className={styles.messageContainer} ref={chatWindowRef}>
        {messages?.length ? (
          (waitingForResponse
            ? [...messages, waitingForResponseMessage]
            : messages
          )?.map((m) => (
            <div className={styles.chatMessage}>
              <div className={styles.chatHeader}>
                {m.isResponse ? (
                  <Avatar
                    size="sm"
                    src="https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Sugar"
                  />
                ) : (
                  <Avatar size="sm" src={userAvatarSrc} />
                )}
              </div>
              <div className={styles.chatBody}>
                <span className={styles.chatMeta}>
                  {globalDateFormatParser(m.timestamp)}
                </span>
                <MessageBody chatMessage={m} />
              </div>
            </div>
          ))
        ) : (
          <Text opacity={0.5} className={styles.emptyChat}>
            <IconBulb size={30} />
            Curious about something? Dive in...
          </Text>
        )}
      </div>
      <div className={styles.chatInputContainer}>
        <Textarea
          size="md"
          className={styles.chatInput}
          onChange={handleInputChange}
          onKeyDown={handleEnter}
          value={inputValue}
          placeholder="Type your message..."
          disabled={waitingForResponse}
          rightSection={
            <ActionIcon variant="transparent" onClick={handleSendMessage}>
              <IconSend size={20} />
            </ActionIcon>
          }
        />
      </div>
    </div>
  )
}

export default ChatWindow
