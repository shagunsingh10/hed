import { loadMessagesApi } from '@/apis/chats'
import { CHAT_MESSAGE_BG, COLOR_BG_TEXT } from '@/constants'
import { globalDateFormatParser } from '@/lib/functions'
import { Message } from '@/types/chats'
import {
  BulbOutlined,
  CloseCircleOutlined,
  HistoryOutlined,
  MessageFilled,
  PlusCircleOutlined,
  SendOutlined,
} from '@ant-design/icons'
import {
  Avatar,
  Button,
  Drawer,
  Input,
  List,
  message,
  Skeleton,
  Space,
  Spin,
  Typography,
} from 'antd'
import { FC, useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import useStore from '../../store'
import styles from './chatbot.module.scss'
import CodeBlock from './Codeblock'

type ChatWindowProps = {
  projectId?: string
}

const ChatWindow: FC<ChatWindowProps> = ({ projectId }) => {
  // states
  const [inputValue, setInputValue] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [showHistory, setShowHistory] = useState<boolean>(false)

  const postQuery = useStore((state) => state.postQuery)
  const addChat = useStore((state) => state.addChat)
  const loadChats = useStore((state) => state.loadChats)
  const setMessages = useStore((state) => state.setMessages)
  const setActiveChatId = useStore((state) => state.setActiveChatId)
  const activeChatId = useStore((state) => state.activeChatId)
  const chats = useStore((state) => state.chats)
  const messages = useStore((state) => state.messages)
  const waitingForResponse = useStore((state) => state.waitingForResponse)

  const chatWindowRef = useRef<HTMLDivElement>(null)

  const waitingForResponseMessage: Message = {
    id: 'waiting-for-response',
    chatId: activeChatId || '',
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
      if (!activeChatId) {
        addChat(projectId).then((chatId) => {
          postQuery(chatId, inputValue)
        })
      } else {
        postQuery(activeChatId, inputValue)
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

  const addNewChat = async () => {
    const newChatId = await addChat(projectId)
    setActiveChatId(newChatId)
    loadChats(projectId) // on success
  }

  // useEffects
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    setLoading(true)
    if (activeChatId) {
      loadMessagesApi(activeChatId)
        .then((messages) => setMessages(messages))
        .catch(() => message.error('Failed to load previous messages'))
        .finally(() => setLoading(false))
    }
  }, [activeChatId])

  useEffect(() => {
    setLoading(true)
    loadChats(projectId).finally(() => setLoading(false))
  }, [projectId])

  return (
    <div className={styles.chatWindow}>
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
                  avatar={<Avatar>{message.isResponse ? 'H' : 'Y'}</Avatar>}
                  title={
                    <Space>
                      {message.isResponse ? 'Herald' : 'You'}
                      <Space className={styles.messageTime}>
                        {globalDateFormatParser(message.timestamp)}
                      </Space>
                    </Space>
                  }
                  description={
                    <Space
                      className={styles.chatMessageContent}
                      style={{
                        background: message.isResponse
                          ? CHAT_MESSAGE_BG
                          : 'transparent',
                      }}
                    >
                      {message.id === 'waiting-for-response' ? (
                        <Spin size="small" spinning={true} />
                      ) : (
                        <ReactMarkdown
                          children={message.content}
                          components={{
                            code: CodeBlock,
                          }}
                        />
                      )}
                    </Space>
                  }
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
          autoSize={{ minRows: 1, maxRows: 6 }}
          disabled={waitingForResponse}
        />
        <Button
          title="Send"
          className={styles.sendButton}
          size="middle"
          onClick={handleSendMessage}
          icon={<SendOutlined />}
          disabled={waitingForResponse}
        />
        <Button
          title="History"
          className={styles.sendButton}
          size="middle"
          onClick={() => setShowHistory(true)}
          icon={<HistoryOutlined />}
          disabled={waitingForResponse}
        />
      </div>
      <Drawer
        open={showHistory}
        onClose={() => setShowHistory(false)}
        title="Chat History"
        className={styles.chatHistoryDrawer}
        closeIcon={<CloseCircleOutlined />}
      >
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
      </Drawer>
    </div>
  )
}

export default ChatWindow
