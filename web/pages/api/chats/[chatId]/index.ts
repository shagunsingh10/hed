import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import type { ApiRes } from "@/types/api";
import { Message } from "@/types/chats";
import { getUserInfoFromSessionToken } from "@/lib/auth";
import { sendMessageToPythonService } from "@/lib/redis";
import { config as appConfig } from "@/config";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<Message[] | Message>>
) => {
  const sessionToken = req.headers.sessiontoken as string;
  const user = await getUserInfoFromSessionToken(sessionToken);
  let chatId = req.query.chatId as string;

  switch (req.method) {
    case "GET":
      const messages = await prisma.message.findMany({
        where: {
          chatId: chatId,
        },
        orderBy: {
          timestamp: "asc",
        },
      });
      res.status(200).json({
        success: true,
        data: messages,
      });
      break;
    case "POST":
      const { content } = req.body;
      const newMessage = await prisma.$transaction(async (tx) => {
        const [nm, chat] = await Promise.all([
          tx.message.create({
            data: {
              chatId: chatId,
              content: content,
              isResponse: false,
            },
          }),
          tx.chat.findFirst({
            where: {
              id: chatId,
            },
            select: {
              projectId: true,
            },
          }),
        ]);

        // find all collections to get query context from
        let collections;
        // if project specific chat, just read project specific collections
        if (chat?.projectId) {
          collections = await tx.knowledgeGroup.findMany({
            where: {
              projectId: chat.projectId,
              UserRole: {
                some: {
                  userId: user?.id,
                },
              },
            },
            select: {
              id: true,
            },
          });
        } else {
          // else, read all collections
          collections = await tx.knowledgeGroup.findMany({
            where: {
              UserRole: {
                some: {
                  userId: user?.id,
                },
              },
            },
            select: {
              id: true,
            },
          });
        }

        // send qury and collection name to query processing engine
        await sendMessageToPythonService(
          JSON.stringify({
            job_type: "query",
            payload: {
              query: content,
              collections: collections.map((e) => e.id),
              chat_id: chatId,
              user: user?.email,
            },
          })
        );
        return nm;
      });

      res.status(201).json({
        success: true,
        data: newMessage,
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
