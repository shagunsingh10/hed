import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ApiRes } from "types/api";
import { ProjectSlice } from "types/projects";

type PrismaProjectRecord = {
  id: string;
  name: string;
  description: string | null;
  tags: string | null;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
};

const processTags = (project: PrismaProjectRecord): ProjectSlice => {
  return {
    ...project,
    tags: project.tags?.split(",").map((tag) => tag?.trim()) || [],
  };
};

const GET = async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const id = params.id;

  const project = await prisma.project.findFirst({
    where: {
      id: id,
    },
  });

  if (!project) {
    return NextResponse.json<ApiRes<string>>(
      {
        success: false,
        error: "Project not found",
      },
      {
        status: 404,
      }
    );
  }

  return NextResponse.json<ApiRes<ProjectSlice>>(
    {
      success: true,
      data: processTags(project),
    },
    {
      status: 200,
    }
  );
};

export { GET };
