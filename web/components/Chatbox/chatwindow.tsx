import { useState, useRef, useEffect, FC } from "react";
import {
  Input,
  List,
  Avatar,
  Space,
  Skeleton,
  Typography,
  Button,
  message,
  Spin,
} from "antd";
import { SendOutlined, BulbOutlined, SyncOutlined } from "@ant-design/icons";
import useStore from "../../store";
import { CHAT_MESSAGE_BG, COLOR_BG_TEXT } from "@/constants";
import styles from "./chatbot.module.scss";
import { globalDateFormatParser } from "@/lib/functions";
import { Message } from "@/types/chats";
import ReactMarkdown from "react-markdown";
import CodeBlock from "./Codeblock";

type ChatWindowProps = {
  chatId?: string;
  height: string;
  projectId?: string;
};

const ChatWindow: FC<ChatWindowProps> = ({ chatId, height, projectId }) => {
  // states
  const [inputValue, setInputValue] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const messages = useStore((state) => state.messages);
  const postQuery = useStore((state) => state.postQuery);
  const addChat = useStore((state) => state.addChat);
  const loadMessages = useStore((state) => state.loadMessages);
  const waitingForResponse = useStore((state) => state.waitingForResponse);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  const waitingForResponseMessage: Message = {
    id: "waiting-for-response",
    chatId: chatId || "",
    content: "",
    timestamp: new Date(),
    isResponse: true,
  };

  // functions
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() !== "") {
      if (!chatId) {
        addChat(projectId).then((chatId) => {
          postQuery(chatId, inputValue);
        });
      } else {
        postQuery(chatId, inputValue);
      }
      setInputValue("");
    }
  };

  const handleRegenerate = () => {
    const lastUserMessage = messages?.find((e) => e.isResponse === false);
    if (!lastUserMessage || !chatId) {
      message.error("No message to regenerate");
    } else {
      postQuery(chatId, lastUserMessage.content);
    }
  };

  const handleEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.altKey && e.key === "Enter") {
      setInputValue((prev) => prev + "\n");
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // useEffects
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (chatId) {
      setLoading(true);
      loadMessages(chatId).finally(() => setLoading(false));
    }
  }, [chatId]);

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
                  avatar={<Avatar>{message.isResponse ? "H" : "Y"}</Avatar>}
                  title={
                    <Space>
                      {message.isResponse ? "Herald" : "You"}
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
                          : "transparent",
                      }}
                    >
                      {message.id === "waiting-for-response" ? (
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
          // onPressEnter={handleEnter}
          onKeyDown={handleEnter}
          value={inputValue}
          placeholder="Type your message..."
          autoSize={{ minRows: 1, maxRows: 6 }}
          disabled={waitingForResponse}
        />
        <Button
          title="Send"
          className={styles.sendButton}
          color="secondary"
          size="large"
          onClick={handleSendMessage}
          icon={<SendOutlined />}
          disabled={waitingForResponse}
        />
        <Button
          title="Regerenrate"
          className={styles.sendButton}
          color="secondary"
          size="large"
          onClick={handleRegenerate}
          icon={<SyncOutlined />}
          disabled={waitingForResponse}
        />
      </div>
    </div>
  );
};

export default ChatWindow;
