import { useState, useRef, useEffect, FC } from "react";
import { Card, Input, List, Avatar } from "antd";
import { SendOutlined } from "@ant-design/icons";
import useStore from "../../store";

import type { Message } from "@/types/chats";
import styles from "./chatbot.module.scss";
import { createId } from "@paralleldrive/cuid2";

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

type ChatWindowProps = {
  chatId: string;
  height: string;
};

const ChatWindow: FC<ChatWindowProps> = ({ chatId, height }) => {
  // states
  const [inputValue, setInputValue] = useState<string>("");
  const messages = useStore((state) => state.messages);
  const addMessage = useStore((state) => state.addMessage);
  const loadMessages = useStore((state) => state.loadMessages);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  // functions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = () => {
    if (inputValue.trim() !== "") {
      // handle logic for sending query & adding replies (using websockets)
      const newMessage: Message = {
        id: createId(),
        chatId: chatId,
        timestamp: new Date(),
        isResponse: false,
        content: inputValue,
      };

      const newReply: Message = {
        id: createId(),
        chatId: chatId,
        timestamp: new Date(),
        isResponse: true,
        content: generateRandomText(),
      };

      addMessage(newMessage);
      addMessage(newReply);
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
