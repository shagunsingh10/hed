import { useState, useRef, useEffect } from "react";
import { Card, Input, List, Avatar, Typography, Row, Col, Menu } from "antd";
import { SendOutlined, FileOutlined } from "@ant-design/icons";

import type { MenuProps } from "antd";
import styles from "./ask.module.scss";

type MenuItem = Required<MenuProps>["items"][number];
interface Message {
  id: number;
  sender: string;
  text: string;
}

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: "group"
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as MenuItem;
}

const items: MenuItem[] = [1, 2, 3, 4, 5, 6, 7].map((i) =>
  getItem(`Chat ${i}`, `${i}`, <FileOutlined />)
);

function generateRandomText() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ    abcdefghijklmnopqrstuvwxyz0123456789          ";
  const minLength = 40;
  const maxLength = 200;
  const length =
    Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;

  let randomString = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }

  return randomString;
}

const ChatScreen: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = () => {
    if (inputValue.trim() !== "") {
      const newMessage: Message = {
        id: messages.length + 1,
        sender: "You",
        text: inputValue,
      };

      const newReply: Message = {
        id: messages.length + 1,
        sender: "Herald",
        text: generateRandomText(),
      };

      setMessages([...messages, newMessage, newReply]);
      setInputValue("");
    }
  };

  return (
    <div className={styles.chatScreen}>
      <div className={styles.chatHistoryContainer}>
        <Menu
          className={styles.chatList}
          defaultSelectedKeys={["1"]}
          defaultOpenKeys={["1"]}
          mode="inline"
          color="secondary"
          inlineCollapsed={false}
          items={items}
        />
      </div>
      <div className={styles.chatContainer}>
        <Typography.Title level={3} className={styles.chatTitle}>
          How to train a model?
        </Typography.Title>
        <Card className={styles.chatWindow} ref={chatWindowRef}>
          <List
            itemLayout="horizontal"
            dataSource={messages}
            renderItem={(message) => (
              <List.Item
                className={styles.chatMessage}
                style={{
                  background:
                    message.sender == "You" ? "transparent" : "#2ed27c2a",
                }}
              >
                <List.Item.Meta
                  avatar={<Avatar>{message.sender[0]}</Avatar>}
                  title={message.sender}
                  description={message.text}
                />
              </List.Item>
            )}
          />
        </Card>
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
    </div>
  );
};

export default ChatScreen;
