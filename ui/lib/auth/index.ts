import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Session } from "next-auth";

const isAuthenticated = async (
  request: any,
  res: any
): Promise<Session | null> => {
  const session = await getServerSession(request, res, authOptions);
  return session;
};

export { isAuthenticated };
