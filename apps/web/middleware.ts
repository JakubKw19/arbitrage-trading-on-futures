import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  //   const sessionCookie =
  //     req.cookies.get("next-auth.session-token") ||
  //     req.cookies.get("__Secure-next-auth.session-token");

  //   if (!sessionCookie) {
  //     return NextResponse.redirect(new URL("/login", req.url));
  //   }

  const response = NextResponse.next();

  response.headers.set("x-pathname", new URL(req.url).pathname);

  return response;
}

export const config = {
  matcher: ["/home/:path*", "/profile/:path*", "/settings/:path*"],
};
