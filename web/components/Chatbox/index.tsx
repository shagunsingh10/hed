import { useEffect, useState, FC } from "react";
import { Menu, Button } from "antd";
import { MessageOutlined, PlusCircleOutlined } from "@ant-design/icons";
import useStore from "@/store";
import ChatWindow from "./chatwindow";
import { useSession } from "next-auth/react";
import type { MenuProps } from "antd";
import styles from "./chatbot.module.scss";

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  type?: "group"
): MenuItem {
  return {
    key,
    icon,
    label,
    type,
  } as MenuItem;
}

type ChatBoxProps = {
  scope: "generic" | "project";
  projectId?: string;
  height: string;
};

const Chatbox: FC<ChatBoxProps> = ({ scope, height, projectId }) => {
  // states
  const { data: session } = useSession();
  const chats = useStore((state) => state.chats);
  const loadChats = useStore((state) => state.loadChats);
  const addChat = useStore((state) => state.addChat);
  const activeChatId = useStore((state) => state.activeChatId);
  const setActiveChatId = useStore((state) => state.setActiveChatId);

  const items: MenuItem[] = chats?.map((chat) =>
    getItem(chat.title, chat.id, <MessageOutlined />)
  );

  //functions
  const handleChatClick = (id: any) => {
    setActiveChatId(id);
  };

  const addNewChat = async () => {
    // send to backend
    const newChatId = await addChat(projectId);
    setActiveChatId(newChatId);
    loadChats(scope, projectId); // on success
  };

  useEffect(() => {
    if (loadChats) loadChats(scope, projectId);
  }, [loadChats, scope, projectId]);

  useEffect(() => {
    if (chats && chats.length > 0) setActiveChatId(chats[0].id);
  }, [chats]);

  return (
    <div className={styles.chatScreen} style={{ height }}>
      <div className={styles.chatHistoryContainer}>
        <Button
          className={styles.newChatButton}
          type="primary"
          onClick={addNewChat}
        >
          <PlusCircleOutlined />
          New Chat
        </Button>
        <Menu
          className={styles.chatList}
          defaultActiveFirst={true}
          mode="vertical"
          items={items}
          onClick={(e) => handleChatClick(e.key)}
        />
      </div>
      <ChatWindow chatId={activeChatId} height={height} />
    </div>
  );
};

export default Chatbox;
