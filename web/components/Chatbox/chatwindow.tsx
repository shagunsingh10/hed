import { useState, useRef, useEffect, FC } from "react";
import { Card, Input, List, Avatar, Space } from "antd";
import { SendOutlined } from "@ant-design/icons";
import useStore from "../../store";

import styles from "./chatbot.module.scss";
import { globalDateFormatParser } from "@/lib/functions";

type ChatWindowProps = {
  chatId: string;
  height: string;
};

const ChatWindow: FC<ChatWindowProps> = ({ chatId, height }) => {
  // states
  const [inputValue, setInputValue] = useState<string>("");
  const messages = useStore((state) => state.messages);
  const postQuery = useStore((state) => state.postQuery);
  const loadMessages = useStore((state) => state.loadMessages);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  // functions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    if (chatId) loadMessages(chatId);
  }, [chatId]);

  return (
    <Card className={styles.chatWindow}>
      <div
        className={styles.messageContainer}
        style={{ height: `calc(${height} - 6em)` }}
        ref={chatWindowRef}
      >
        <List
          itemLayout="horizontal"
          dataSource={messages}
          renderItem={(message) => (
            <List.Item
              className={styles.chatMessage}
              style={{
                background: message.isResponse ? "#291E24" : "transparent",
              }}
            >
              <List.Item.Meta
                avatar={<Avatar>{message.isResponse ? "H" : "Y"}</Avatar>}
                title={
                  <Space>
                    {message.isResponse ? "Herald" : "You"} (
                    {globalDateFormatParser(message.timestamp)})
                  </Space>
                }
                description={message.content}
              />
            </List.Item>
          )}
        />
      </div>
      <div className={styles.typerContainer}>
        <Input.Search
          placeholder="Type your message..."
          enterButton={
            <span>
              <SendOutlined /> Send
            </span>
          }
          value={inputValue}
          onChange={handleInputChange}
          onSearch={handleSendMessage}
        />
      </div>
    </Card>
  );
};

export default ChatWindow;
