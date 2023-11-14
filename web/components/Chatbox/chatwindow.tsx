import { useState, useRef, useEffect, FC } from "react";
import { Input, List, Avatar, Space, Skeleton, Typography, Button } from "antd";
import { SendOutlined, BulbOutlined, SyncOutlined } from "@ant-design/icons";
import useStore from "../../store";
import { CHAT_MESSAGE_BG, COLOR_BG_TEXT } from "@/constants";
import styles from "./chatbot.module.scss";
import { globalDateFormatParser } from "@/lib/functions";

type ChatWindowProps = {
  chatId: string;
  height: string;
};

const ChatWindow: FC<ChatWindowProps> = ({ chatId, height }) => {
  // states
  const [inputValue, setInputValue] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const messages = useStore((state) => state.messages);
  const postQuery = useStore((state) => state.postQuery);
  const loadMessages = useStore((state) => state.loadMessages);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  // functions
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() !== "") {
      // handle logic for sending query & adding replies (using websockets)
      postQuery(chatId, inputValue);
      setInputValue("");
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
            dataSource={messages}
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
                      {message.content}
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
          value={inputValue}
          placeholder="Type your message..."
          autoSize={{ minRows: 1, maxRows: 6 }}
        />
        <Button
          title="Send"
          className={styles.sendButton}
          color="secondary"
          size="large"
          onClick={handleSendMessage}
          icon={<SendOutlined />}
        />
        <Button
          title="Regerenrate"
          className={styles.sendButton}
          color="secondary"
          size="large"
          // onClick={handleSendMessage}
          icon={<SyncOutlined />}
        />
      </div>
    </div>
  );
};

export default ChatWindow;
