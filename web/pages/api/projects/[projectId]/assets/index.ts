import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import type { ApiRes } from "@/types/api";
import { Asset } from "@/types/assets";
import { getUserInfoFromSessionToken } from "@/lib/auth";
import { hasViewerAccessToProject } from "@/lib/auth/access";

type PrismaAssetRecord = {
  KnowledgeGroup?: any;
  id: string;
  knowledgeGroupId: string;
  name: string;
  assetTypeId: string;
  description: string | null;
  tags: string | null;
  ownerUserId: number;
  status: string;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
};

const processTags = (asset: PrismaAssetRecord): Asset => {
  return {
    ...asset,
    description: asset.description || undefined,
    knowledgeGroupName: asset.KnowledgeGroup?.name,
    createdAt: asset.createdAt.toISOString(),
    tags: asset.tags?.split(",").map((tag) => tag?.trim()) || [],
  };
};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<Asset | Asset[]>>
) => {
  const projectId = req.query.projectId as string;
  const sessionToken = req.headers.sessiontoken as string;
  const user = await getUserInfoFromSessionToken(sessionToken);

  switch (req.method) {
    case "GET":
      const projectViewAllowed = await hasViewerAccessToProject(
        projectId,
        Number(user?.id)
      );

      let assets;
      if (projectViewAllowed) {
        assets = await prisma.asset.findMany({
          where: {
            KnowledgeGroup: {
              projectId: projectId,
            },
          },
          include: {
            KnowledgeGroup: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });
      } else {
        assets = await prisma.asset.findMany({
          where: {
            KnowledgeGroup: {
              UserRole: {
                some: {
                  userId: user?.id,
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });
      }

      res.status(200).json({
        success: true,
        data: assets ? assets.map((e) => processTags(e)) : [],
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
