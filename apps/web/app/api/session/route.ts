import { authClient } from "@/lib/auth-client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Get cookies from the request
  const cookieHeader = req.headers.get("cookie") || "";

  const session = await authClient.getSession();

  return NextResponse.json(session);
}
