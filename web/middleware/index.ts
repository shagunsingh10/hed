import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { ApiRes } from "types/api";

export const config = {
  matcher: "/api/:function*",
};

export async function middleware(request: NextRequest, response: NextResponse) {
  const session = await isAuthenticated(request, response);
  if (!session) {
    return NextResponse.json<ApiRes<string>>(
      { success: false, error: "authentication failed" },
      { status: 401 }
    );
  }
  request.headers.set("session", JSON.stringify(session));
}
