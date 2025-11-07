import { config } from "dotenv";
import { dirname, join } from "path";
import { betterAuth } from "better-auth";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, "../../../.env") });

export const auth = betterAuth({
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      redirectURI: "http://localhost:5000/api/auth/callback/google",
    },
  },
  // redirects: {
  //   afterSignIn: "http://localhost:3000/home",
  //   afterSignOut: "http://localhost:3000/",
  // },
  jwt: {
    secret: process.env.AUTH_SECRET!,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    cookie: {
      domain: "localhost",
      sameSite: "lax",
      secure: false,
    },
  },
  trustedOrigins: ["http://localhost:3000", "http://localhost:5000"],
});
