import { useEffect, useState, FC } from "react";
import { Menu, Button, Drawer } from "antd";
import { MessageOutlined, PlusCircleOutlined } from "@ant-design/icons";
import useStore from "@/store";
import ChatWindow from "./chatwindow";
import styles from "./chatbot.module.scss";

type ChatBoxProps = {
  scope: "generic" | "project";
  projectId?: string;
  height: string;
};

const Chatbox: FC<ChatBoxProps> = ({ scope, height, projectId }) => {
  // states
  const [chatHistoryOpen, setChatHistoryOpen] = useState<boolean>(false);

  const chats = useStore((state) => state.chats);
  const loadChats = useStore((state) => state.loadChats);
  const addChat = useStore((state) => state.addChat);
  const activeChatId = useStore((state) => state.activeChatId);
  const setActiveChatId = useStore((state) => state.setActiveChatId);

  //functions
  const addNewChat = async () => {
    const newChatId = await addChat(projectId);
    setActiveChatId(newChatId);
    loadChats(scope, projectId); // on success
  };

  useEffect(() => {
    if (loadChats) loadChats(scope, projectId);
  }, [loadChats, scope, projectId]);

  return (
    <div className={styles.chatScreen}>
      <div className={styles.chatButtons}>
        <Button
          className={styles.newChatButton}
          type="primary"
          ghost
          onClick={addNewChat}
        >
          <PlusCircleOutlined />
          New Chat
        </Button>
        <Button
          className={styles.newChatButton}
          type="primary"
          ghost
          onClick={() => setChatHistoryOpen(true)}
        >
          <MessageOutlined />
          Chat History
        </Button>
      </div>
      <Drawer
        title="Chat History"
        className={styles.chatHistoryContainer}
        placement="right"
        open={chatHistoryOpen}
        onClose={() => setChatHistoryOpen(false)}
      >
        <Menu
          className={styles.chatList}
          defaultActiveFirst={true}
          mode="vertical"
        >
          {chats.map((chat, id) => (
            <Menu.Item
              icon={<MessageOutlined />}
              key={id}
              onClick={() => setActiveChatId(chat.id)}
              className={styles.chatListItem}
            >
              {chat.title}
            </Menu.Item>
          ))}
        </Menu>
      </Drawer>
      <ChatWindow chatId={activeChatId} height={height} projectId={projectId} />
    </div>
  );
};

export default Chatbox;
