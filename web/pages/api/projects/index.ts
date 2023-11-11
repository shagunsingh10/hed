import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import type { ApiRes } from "@/types/api";
import { Project } from "@/types/projects";
import { getUserInfoFromSessionToken } from "@/lib/auth";

type PrismaProjectRecord = {
  id: string;
  name: string;
  description: string | null;
  tags: string | null;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
};

const processTags = (project: PrismaProjectRecord): Project => {
  return {
    ...project,
    tags: project.tags?.split(",").map((tag) => tag?.trim()) || [],
  };
};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<Project | Project[]>>
) => {
  const sessionToken = req.headers.sessiontoken as string;
  const user = await getUserInfoFromSessionToken(sessionToken);

  switch (req.method) {
    case "GET":
      const projects = await prisma.project.findMany({
        where: {
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
        data: projects.map((e) => processTags(e)),
      });
      break;

    case "POST":
      const body = await req.body;
      const newProject = await prisma.project.create({
        data: {
          name: body.name,
          description: body.description,
          tags: body.tags,
          createdBy: user?.email as string,
          UserRole: {
            create: {
              role: "owner",
              userId: Number(user?.id),
            },
          },
        },
      });

      res.status(201).json({
        success: true,
        data: processTags(newProject),
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
