const fs = require('fs');
const path = require('path');

const root = path.join(process.cwd(), 'docflow');

const files = {
  "src/lib/auth.ts": `import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  session: { expiresIn: 60 * 60 * 24 * 7 },
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
});

export type Auth = typeof auth;
`,
  "src/lib/prisma.ts": `import { PrismaClient } from "@prisma/client";
const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
`,
  "src/app/api/auth/[...all]/route.ts": `import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
export const { GET, POST } = toNextJsHandler(auth);
`,
  "src/lib/auth-client.ts": `import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
});
export const { signIn, signUp, signOut, useSession } = authClient;
`,
  "docflow/middleware.ts": `import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // Simple check for demonstration
  return NextResponse.next();
}

export const config = {
  matcher: ["/(dashboard)/:path*"],
};
`
};

Object.entries(files).forEach(([file, content]) => {
  const fullPath = path.join(root, file.replace('docflow/', ''));
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
});

console.log("Written auth and prisma files.");
