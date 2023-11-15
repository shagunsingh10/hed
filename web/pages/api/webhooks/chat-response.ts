import { NextApiRequest, NextApiResponse } from "next";
import type { ApiRes } from "@/types/api";
import { config as appConfig } from "@/config";
import { prisma } from "@/lib/prisma";
import { getSocketClientId } from "@/lib/socket/handler";
import type { NextApiResponseWithSocket } from "../socket";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponseWithSocket<ApiRes<string>>
) => {
  switch (req.method) {
    case "PUT":
      const response = req.body.response as string;
      const chatId = req.body.chatId as string;
      const apiKey = req.body.apiKey as string;

      if (apiKey != appConfig.serviceApiKey) {
        return res.status(401).json({ success: false });
      }

      const [message, chatUser] = await prisma.$transaction([
        prisma.message.create({
          data: {
            chatId: chatId,
            content: response,
            isResponse: true,
          },
        }),
        prisma.chat.findFirst({
          where: {
            id: chatId,
          },
          select: {
            User: {
              select: {
                email: true,
              },
            },
          },
        }),
      ]);

      // send response to user via socket
      const io = res.socket.server.io;
      if (chatUser?.User.email && io) {
        getSocketClientId(chatUser.User.email).then((socketId) => {
          if (socketId)
            io.to(socketId).emit("chat-response", {
              chatId: chatId,
              response: response,
              messageId: message.id,
              timestamp: message.timestamp,
            });
        });
      }

      res.status(201).json({
        success: true,
        data: "",
      });
      break;

    default:
      res.status(405).json({
        success: true,
        error: "Method not allowed",
      });
      break;
  }
};

export default handler;
