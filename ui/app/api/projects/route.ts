import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ApiRes } from "types/api";
import { ProjectSlice } from "types/projects";

type PrismaProjectRecord = {
  id: string;
  name: string;
  description: string | null;
  tags: string | null;
  stars: number;
  likes: number;
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

const GET = async () => {
  const projects = await prisma.project.findMany();

  return NextResponse.json<ApiRes<ProjectSlice[]>>(
    {
      success: true,
      data: projects.map((e) => processTags(e)),
    },
    {
      status: 200,
    }
  );
};

const POST = async (req: NextRequest) => {
  const body = await req.json();

  const newProject = await prisma.project.create({
    data: {
      name: body.name,
      description: body.description,
      tags: body.tags,
      createdBy: "user1",
    },
  });

  return NextResponse.json<ApiRes<ProjectSlice>>(
    {
      success: true,
      data: processTags(newProject),
    },
    {
      status: 201,
    }
  );
};

export { GET, POST };
