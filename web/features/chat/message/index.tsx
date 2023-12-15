import { Message } from '@/types/chats'
import { Card, Loader } from '@mantine/core'
import { FC } from 'react'
import ReactMarkdown from 'react-markdown'
import CodeBlock from './Codeblock'
import styles from './message.module.scss'
import SourceInfoModal from './Source'

type MessageProps = {
  chatMessage: Message
}
const MessageBody: FC<MessageProps> = ({ chatMessage }) => {
  return (
    <div className={styles.chatMessageContent}>
      {chatMessage.isResponse ? (
        chatMessage.id === 'waiting-for-response' ? (
          <Loader size="xs" />
        ) : (
          <>
            <Card className={styles.responseMessageText}>
              <ReactMarkdown
                children={chatMessage.content}
                components={{
                  code: CodeBlock,
                }}
              />
            </Card>
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
        <Card className={styles.messageText}>{chatMessage.content}</Card>
      )}
    </div>
  )
}

export default MessageBody
