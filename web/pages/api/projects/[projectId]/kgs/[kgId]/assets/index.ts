import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import type { ApiRes } from "@/types/api";
import { Asset, CreateAssetData } from "@/types/assets";
import { getUserInfoFromSessionToken } from "@/lib/auth";
import {
  hasViewerAccessToProject,
  hasViewerAccessToKg,
  hasContributorAccessToKg,
  hasContributorAccessToProject,
} from "@/lib/auth/access";
import { sendMessageToPythonService } from "@/lib/redis";
import { config as appConfig } from "@/config";

type PrismaAssetRecord = {
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
    tags: asset.tags?.split(",").map((tag) => tag?.trim()) || [],
  };
};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiRes<Asset | Asset[]>>
) => {
  const projectId = req.query.projectId as string;
  const kgId = req.query.kgId as string;
  const sessionToken = req.headers.sessiontoken as string;
  const user = await getUserInfoFromSessionToken(sessionToken);

  switch (req.method) {
    case "GET":
      const [projectViewAllowed, kgViewAllowed] = await Promise.all([
        await hasViewerAccessToProject(projectId, Number(user?.id)),
        await hasViewerAccessToKg(kgId, Number(user?.id)),
      ]);

      if (!projectViewAllowed && !kgViewAllowed) {
        return res.status(404).json({
          success: false,
          error: "Resource not found",
        });
      }

      const kgs = await prisma.asset.findMany({
        where: {
          knowledgeGroupId: kgId,
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
      const body: CreateAssetData = await req.body;

      const [projectContributorAccess, kgContributorAccess] = await Promise.all(
        [
          await hasContributorAccessToProject(projectId, Number(user?.id)),
          await hasContributorAccessToKg(kgId, Number(user?.id)),
        ]
      );

      if (!projectContributorAccess || !kgContributorAccess) {
        return res.status(403).json({
          success: false,
          error:
            "User needs atleast contributor access in project or knowledge group to be able to create an asset.",
        });
      }

      const newAsset = await prisma.$transaction(async (tx) => {
        const newA = await tx.asset.create({
          data: {
            name: body.name,
            knowledgeGroupId: kgId,
            description: body.description,
            tags: body.tags,
            uploadId: body.uploadId,
            createdBy: user?.email as string,
            ownerUserId: user?.id as number,
            assetTypeId: body.assetTypeId,
          },
        });
        const assetType = await tx.assetType.findFirst({
          where: {
            id: body.assetTypeId,
          },
          select: {
            key: true,
          },
        });
        if (!assetType?.key) {
          res.status(400).json({
            success: false,
            error: "Unknown Asset Type",
          });
          throw new Error("Unknown Asset Type");
        }
        sendMessageToPythonService(
          JSON.stringify({
            job_type: "ingestion",
            payload: {
              filepaths: [
                `${appConfig.assetUploadPath}/${projectId}/${kgId}/${body.uploadId}`,
              ],
              type: assetType.key,
              collection_name: kgId,
              asset_id: newA.id,
            },
          })
        );
        return newA;
      });

      res.status(201).json({
        success: true,
        data: processTags(newAsset),
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