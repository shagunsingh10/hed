import { addNewChatApi, loadMessagesApi } from '@/apis/chats'
import { AVATAR_BG, COLOR_BG_TEXT, PRIMARY_COLOR } from '@/constants'
import { globalDateFormatParser } from '@/lib/functions'
import { Message } from '@/types/chats'
import { BulbOutlined, RobotOutlined, SendOutlined } from '@ant-design/icons'
import {
  Avatar,
  Button,
  Input,
  List,
  message,
  Skeleton,
  Space,
  Tag,
  Typography,
} from 'antd'
import { FC, useEffect, useRef, useState } from 'react'
import useStore from '../../../store'
import MessageBody from '../MessageBody'
import styles from './chat.module.scss'

type ChatWindowProps = {
  projectId?: string
}

const ChatWindow: FC<ChatWindowProps> = ({ projectId }) => {
  // states
  const [inputValue, setInputValue] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [userAvatarSrc, setuserAvatarSrc] = useState<string>('')

  const postQuery = useStore((state) => state.postQuery)
  const loadChats = useStore((state) => state.loadChats)
  const setMessages = useStore((state) => state.setMessages)
  const addChat = useStore((state) => state.addChat)
  const activeChat = useStore((state) => state.activeChat)
  const messages = useStore((state) => state.messages)
  const projects = useStore((state) => state.projects)
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
          .catch((e: Error) => message.error(e.message.toString()))
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
    setLoading(true)
    if (activeChat?.id) {
      loadMessagesApi(activeChat.id)
        .then((messages) => setMessages(messages))
        .catch(() => message.error('Failed to load previous messages'))
        .finally(() => setLoading(false))
    }
  }, [activeChat])

  useEffect(() => {
    setLoading(true)
    loadChats(projectId).finally(() => setLoading(false))
  }, [projectId])

  useEffect(() => {
    setuserAvatarSrc(localStorage.getItem('userAvatarSrc') || '')
  }, [])

  return (
    <div className={styles.chatWindow}>
      <div className={styles.chatHeader}>
        <div className={styles.chatTitle}>
          <Avatar icon={<RobotOutlined />} style={{ background: AVATAR_BG }} />
          {activeChat?.title}
        </div>
        <div className={styles.chatProject}>
          {projects.find((e) => activeChat?.projectId === e.id)?.name && (
            <Tag className={styles.projectTag}>
              <img src="/icons/library.svg" width={20} height={20} />
              Project :{' '}
              {projects.find((e) => activeChat?.projectId === e.id)?.name}
            </Tag>
          )}
        </div>
      </div>
      <div className={styles.chatBody}>
        <div className={styles.messageContainer} ref={chatWindowRef}>
          <Skeleton loading={loading} avatar active>
            <List
              itemLayout="horizontal"
              dataSource={
                waitingForResponse
                  ? [...(messages || []), waitingForResponseMessage]
                  : messages
              }
              locale={{
                emptyText: (
                  <Typography.Title level={2} style={{ color: COLOR_BG_TEXT }}>
                    <BulbOutlined /> Curious about something? Dive in...
                  </Typography.Title>
                ),
              }}
              renderItem={(message) => (
                <List.Item className={styles.chatMessage}>
                  <List.Item.Meta
                    avatar={
                      message.isResponse ? (
                        <Avatar
                          icon={'H'}
                          style={{ background: PRIMARY_COLOR }}
                        />
                      ) : (
                        <Avatar
                          src={
                            <img
                              src={userAvatarSrc}
                              referrerPolicy="no-referrer"
                            />
                          }
                        />
                      )
                    }
                    title={
                      <Space>
                        {message.isResponse ? 'Herald AI' : 'You'}
                        <Space className={styles.messageTime}>
                          {globalDateFormatParser(message.timestamp)}
                        </Space>
                      </Space>
                    }
                    description={<MessageBody chatMessage={message} />}
                  />
                </List.Item>
              )}
            />
          </Skeleton>
        </div>
        <div className={styles.chatInputContainer}>
          <Input.TextArea
            size="large"
            className={styles.chatInput}
            onChange={handleInputChange}
            onKeyDown={handleEnter}
            value={inputValue}
            placeholder="Type your message..."
            autoSize={{ minRows: 2, maxRows: 4 }}
            disabled={waitingForResponse}
          />
          <Button
            title="Send"
            className={styles.sendButton}
            size="large"
            onClick={handleSendMessage}
            icon={<SendOutlined rotate={-45} />}
            disabled={waitingForResponse}
          />
        </div>
      </div>
    </div>
  )
}

export default ChatWindow
