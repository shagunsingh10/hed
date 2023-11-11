import { getToken } from "next-auth/jwt";
import { prisma } from "../prisma";
import { NextRequest } from "next/server";
const secret = process.env.NEXTAUTH_SECRET as string;

type user = {
  id: number;
  name: string | null;
  email: string | null;
} | null;

const isAuthenticated = async (req: NextRequest) => {
  const jwt = await getToken({ req, secret, raw: true });
  return jwt;
};

const getUserInfoFromSessionToken = async (
  sessionToken: string
): Promise<user> => {
  const session = await prisma.session.findFirst({
    where: {
      sessionToken: sessionToken,
    },
    select: {
      userId: true,
    },
  });
  const user = await prisma.user.findFirst({
    where: {
      id: session?.userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
  return user;
};

export { isAuthenticated, getUserInfoFromSessionToken };
