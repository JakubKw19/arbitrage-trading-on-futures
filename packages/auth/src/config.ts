import { config } from "dotenv";
import { dirname, join } from "path";
import { betterAuth } from "better-auth";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";
import { prismaAdapter } from "better-auth/adapters/prisma";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, "../../../.env") });

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectURI: "http://localhost:5000/api/auth/callback/google",
    },
  },
  jwt: {
    secret: process.env.AUTH_SECRET!,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    cookie: {
      // Remove explicit domain or set it to undefined
      // domain: undefined,
      sameSite: "lax",
      secure: false,
      // path: "/" // default
    },
  },
  trustedOrigins: ["http://localhost:3000", "http://localhost:5000"],
});
