import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import type { ApiRes } from "@/types/api";
import { Kg } from "@/types/kgs";
import { getUserInfoFromSessionToken } from "@/lib/auth";
import { hasContributorAccessToProject } from "@/lib/auth/access";

type PrismaKgRecord = {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  tags: string | null;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
};

const processTags = (project: PrismaKgRecord): Kg => {
  return {
    ...project,
    tags: project.tags?.split(",").map((tag) => tag?.trim()) || [],
  };
};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<Kg | Kg[]>>
) => {
  const projectId = req.query.projectId as string;
  const sessionToken = req.headers.sessiontoken as string;
  const user = await getUserInfoFromSessionToken(sessionToken);

  switch (req.method) {
    case "GET":
      const kgs = await prisma.knowledgeGroup.findMany({
        where: {
          projectId: projectId,
          UserRole: {
            some: {
              userId: user?.id,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      res.status(200).json({
        success: true,
        data: kgs.map((e) => processTags(e)),
      });
      break;

    case "POST":
      const body = await req.body;

      const isAllowed = await hasContributorAccessToProject(
        projectId,
        Number(user?.id)
      );

      if (!isAllowed) {
        return res.status(403).json({
          success: false,
          error:
            "User needs atleast contributor access in project to be able to create knowledge groups.",
        });
      }

      const newKg = await prisma.knowledgeGroup.create({
        data: {
          name: body.name,
          projectId: projectId,
          description: body.description,
          tags: body.tags,
          createdBy: user?.email as string,
          UserRole: {
            create: {
              userId: Number(user?.id),
              role: "owner",
              projectId: projectId,
            },
          },
        },
      });

      res.status(201).json({
        success: true,
        data: processTags(newKg),
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
