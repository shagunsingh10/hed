import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { ApiRes } from "@/types/api";

export const config = {
  matcher: "/api/((?!auth).*)", // all api routes except auth
};

export async function middleware(request: NextRequest) {
  const sessionToken = await isAuthenticated(request);

  if (!sessionToken) {
    return NextResponse.json<ApiRes<string>>({
      success: false,
      error: "Unautheticated",
    });
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("sessiontoken", sessionToken);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // response.headers.set('x-hello-from-middleware2', 'hello')
  return response;
}
