import { Message } from '@/types/chats'
import { Space, Spin } from 'antd'
import { FC } from 'react'
import ReactMarkdown from 'react-markdown'
import CodeBlock from '../Codeblock'
import SourceInfoModal from '../SourceInfo'
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
            {chatMessage.sources && chatMessage.sources.length > 0 && (
              <div className={styles.chatResponseMessageSources}>
                <h5>Sources: </h5>
                {chatMessage.sources.map((e) => (
                  <SourceInfoModal data={e} />
                ))}
              </div>
            )}
          </>
        )
      ) : (
        <Space>{chatMessage.content}</Space>
      )}
    </div>
  )
}

export default MessageBody
