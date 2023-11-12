import { useCallback, useEffect } from "react";
import io from "socket.io-client";
import { useSession } from "next-auth/react";
import useStore from "@/store";
import { Session } from "next-auth";
import { message } from "antd";

const SocketConnector = () => {
  const { data: session } = useSession();
  const socket = useStore((state) => state.socket);
  const setSocket = useStore((state) => state.setSocket);
  const updateAssetStatus = useStore((state) => state.updateAssetStatus);
  const addMessage = useStore((state) => state.addMessage);
  const activeChatId = useStore((state) => state.activeChatId);

  const connectSocket = useCallback(
    async (session: Session) => {
      const res = await fetch("/api/socket");

      if (!res.ok) {
        console.error("WebSocket server not running...");
        return;
      }

      const socket = io({
        retries: 10,
        ackTimeout: 10000,
      });

      socket.on("connect", () => {
        console.log("socket connected");
        socket.emit("connection-request", { userId: session?.user?.email });
      });

      socket.on("disconnect", () => {
        console.log("disconnect");
      });

      socket.on("update-asset-status", ({ assetId, status }) => {
        if (status) {
          if (status === "success") {
            message.success("Asset ingested successfully!");
          } else if (status === "failed") {
            message.error("Asset ingestion failed!");
          } else {
            return;
          }

          updateAssetStatus(assetId, status);
        }
      });

      socket.on(
        "chat-response",
        ({ chatId, messageId, timestamp, response }) => {
          addMessage({
            chatId: chatId,
            id: messageId,
            timestamp: timestamp,
            content: response,
            isResponse: true,
          });
        }
      );

      setSocket(socket);
    },
    [addMessage, updateAssetStatus, activeChatId]
  );

  console.log(socket?.listeners("chat-response"));

  useEffect(() => {
    if (!socket && session) connectSocket(session);
  }, [session]);

  return null;
};

export default SocketConnector;
