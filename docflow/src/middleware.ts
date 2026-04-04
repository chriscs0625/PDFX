import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // Simple check for demonstration
  return NextResponse.next();
}

export const config = {
  matcher: ["/(dashboard)/:path*"],
};
