import { Message } from '@/types/chats'
import { Space, Spin, Tag } from 'antd'
import { FC } from 'react'
import ReactMarkdown from 'react-markdown'
import CodeBlock from '../Codeblock'
import styles from './message.module.scss'

type MessageProps = {
  chatMessage: Message
}
const MessageBody: FC<MessageProps> = ({ chatMessage }) => {
  return (
    <div className={styles.chatMessageContent}>
      {chatMessage.isResponse ? (
        chatMessage.id === 'waiting-for-response' ? (
          <Spin size="small" spinning={true} />
        ) : (
          <>
            <div className={styles.chatResponseMessage}>
              <span className={styles.messageText}>
                <ReactMarkdown
                  children={chatMessage.content}
                  components={{
                    code: CodeBlock,
                  }}
                />
              </span>
            </div>
            <div className={styles.chatResponseMessageSources}>
              <h5>Sources: </h5>
              {['customers.txt', 'harry potter.pdf'].map((e) => (
                <Tag color={'default'}>{e}</Tag>
              ))}
            </div>
          </>
        )
      ) : (
        <Space>{chatMessage.content}</Space>
      )}
    </div>
  )
}

export default MessageBody
