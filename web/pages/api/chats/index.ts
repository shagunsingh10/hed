import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import type { ApiRes } from "@/types/api";
import { ChatWithoutMessage } from "@/types/chats";
import { getUserInfoFromSessionToken } from "@/lib/auth";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<ChatWithoutMessage | ChatWithoutMessage[]>>
) => {
  const sessionToken = req.headers.sessiontoken as string;
  const user = await getUserInfoFromSessionToken(sessionToken);
  let projectId = req.query.projectId as string | null;

  switch (req.method) {
    case "GET":
      if (!projectId) projectId = null;
      const chats = await prisma.chat.findMany({
        where: {
          userId: user?.id,
          projectId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      res.status(200).json({
        success: true,
        data: chats,
      });
      break;

    case "POST":
      const newChat = await prisma.chat.create({
        data: {
          userId: Number(user?.id),
          projectId: projectId,
          title: `New Chat ${Date.now()}`,
        },
      });

      res.status(201).json({
        success: true,
        data: newChat,
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
